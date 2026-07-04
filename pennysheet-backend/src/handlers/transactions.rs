//! Transactions handlers.

use axum::{
    Json,
    extract::{
        Path,
        Query,
        State,
    },
    http::StatusCode,
};
use chrono::NaiveDate;
use domain::{
    aggregates::CoreAggregate,
    commands::Command,
    errors::DomainError,
    events::Event,
};
use infra::{
    append_event_to_db,
    append_multi_events_to_db,
    get_all_events,
    get_all_sessions,
    get_session_by_id,
    projections::{
        self,
        TimeAggregation,
        TransactionProjectionTrait,
    },
};
use serde::Deserialize;
use std::sync::Arc;
use tracing::{
    debug,
    info,
    instrument,
};
use uuid::Uuid;

use crate::{
    AppState,
    background_jobs::run_transaction_import,
    errors::AppError,
};

#[derive(Deserialize)]
pub struct GetTransactionsQuery {
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
    kind: Option<TransactionKind>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
enum TransactionKind {
    Income,
    Expenses,
}

/// Handler for GET request to /transactions
///
/// # Errors
///
/// Returns [`AppError`] if querying the transactions fails or
/// cannot serialize the projections into JSON values.
#[instrument(
    skip(state, params),
    fields(
        start_date = ?params.start_date,
        end_date = ?params.end_date,
        kind = ?params.kind,
    )
)]
// TODO: write tests for this handler!
pub async fn get_transactions_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<GetTransactionsQuery>,
) -> axum::response::Result<Json<serde_json::Value>, AppError> {
    info!("fetching transactions");
    let result = match params.kind {
        Some(TransactionKind::Income) => {
            let data = projections::income::Entity::get_transactions(
                &state.db,
                params.start_date,
                params.end_date,
                None,
            )
            .await?;
            serde_json::to_value(data)
        },
        Some(TransactionKind::Expenses) => {
            let data = projections::expenses::Entity::get_transactions(
                &state.db,
                params.start_date,
                params.end_date,
                None,
            )
            .await?;
            serde_json::to_value(data)
        },
        None => {
            let data = projections::transactions::Entity::get_transactions(
                &state.db,
                params.start_date,
                params.end_date,
                None,
            )
            .await?;
            serde_json::to_value(data)
        },
    };

    result
        .map(Json)
        .map_err(|err| AppError::Database(err.to_string()))
}

/// Handler for GET request to /transactions/aggregate/{aggregated_level}
///
/// # Errors
///
/// Returns [`AppError`] if querying the transactions fails or
/// cannot serialize the projections into JSON values.
#[instrument(
    skip(state, params),
    fields(
        start_date = ?params.start_date,
        end_date = ?params.end_date,
        kind = ?params.kind,
    )
)]
// TODO: write tests for this handler!
pub async fn get_transactions_time_aggregated_handler(
    State(state): State<Arc<AppState>>,
    Path(aggregated_level): Path<TimeAggregation>,
    Query(params): Query<GetTransactionsQuery>,
) -> axum::response::Result<Json<serde_json::Value>, AppError> {
    info!("fetching transactions");
    let result = match params.kind {
        Some(TransactionKind::Income) => {
            let data = projections::income::Entity::get_transactions_time_aggregated(
                &state.db,
                params.start_date,
                params.end_date,
                aggregated_level,
            )
            .await?;
            serde_json::to_value(data)
        },
        Some(TransactionKind::Expenses) => {
            let data = projections::expenses::Entity::get_transactions_time_aggregated(
                &state.db,
                params.start_date,
                params.end_date,
                aggregated_level,
            )
            .await?;
            serde_json::to_value(data)
        },
        None => {
            let data = projections::transactions::Entity::get_transactions_time_aggregated(
                &state.db,
                params.start_date,
                params.end_date,
                aggregated_level,
            )
            .await?;
            serde_json::to_value(data)
        },
    };

    result
        .map(Json)
        .map_err(|err| AppError::Database(err.to_string()))
}

/// Handler for GET request to /transactions/pivot
///
/// # Errors
///
/// Returns [`AppError`] if querying the transactions fails or
/// cannot serialize the projections into JSON values.
#[instrument(
    skip(state, params),
    fields(
        start_date = ?params.start_date,
        end_date = ?params.end_date,
        kind = ?params.kind,
    )
)]
// TODO: write tests for this handler!
pub async fn get_transactions_pivot_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<GetTransactionsQuery>,
) -> axum::response::Result<Json<serde_json::Value>, AppError> {
    info!("fetching transactions pivot table");
    let result = match params.kind {
        Some(TransactionKind::Income) => {
            return Err(AppError::NotImplemented(
                "Getting pivot table for Income is not supported yet!".to_string(),
            ));
        },
        Some(TransactionKind::Expenses) => {
            let data = projections::expenses::get_expenses_pivot_table(
                &state.db,
                params.start_date,
                params.end_date,
            )
            .await?;
            serde_json::to_value(data)
        },
        None => {
            return Err(AppError::NotImplemented(
                "Getting pivot table for general transactions is not supported yet!".to_string(),
            ));
        },
    };

    result
        .map(Json)
        .map_err(|err| AppError::Database(err.to_string()))
}

/// Handler for GET request to /transactions/{transaction_id}
///
/// # Errors
///
/// Returns [`AppError`] if the querying the transaction fails.
#[instrument(skip(state))]
// TODO: write tests for this handler!
pub async fn get_one_transaction_handler(
    State(state): State<Arc<AppState>>,
    Path(transaction_id): Path<Uuid>,
) -> axum::response::Result<Json<Vec<projections::transactions::Model>>, AppError> {
    info!("fetching one transaction");
    projections::transactions::Entity::get_transactions(&state.db, None, None, Some(transaction_id))
        .await
        .map(Json)
        .map_err(AppError::from)
}

#[derive(Deserialize)]
pub struct ImportTransactionsPayload {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

/// Handler for POST request to /transactions/import
///
/// If an import transaction request event is successfully created, transaction process manager
/// will be spawn and run the import in the background.
///
/// # Errors
///
/// Return [`AppError`] in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Command is rejected by the aggregate.
/// - Failed to insert the new event into the store.
#[instrument(
    skip(state, payload),
    fields(
        start_date = ?payload.start_date,
        end_date = ?payload.end_date,
    )
)]
pub async fn import_transactions_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ImportTransactionsPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let (valid_sessions, expired_sessions) = get_all_sessions(&state.db).await?;
    if !expired_sessions.is_empty() {
        return Err(AppError::ExpiredSession);
    }

    let commands = Command::create_import_transactions(
        payload.start_date.as_deref(),
        payload.end_date.as_deref(),
        valid_sessions
            .iter()
            .map(|session_data| session_data.session_id)
            .collect(),
    )?;
    debug!("import transactions command built");

    let all_events = get_all_events(&state.db).await?;
    let aggregate = CoreAggregate::new(&all_events);

    // NOTE: here, the aggregate doesn't consume the emitted event before executing a new command.
    // This is find in this case as these events are independent, but it does not fully respect the
    // design and concepts of an event-sourcing system.
    let events = commands
        .into_iter()
        .map(|command| aggregate.execute(command))
        .collect::<Result<Vec<Event>, DomainError>>()?;

    let _res = append_multi_events_to_db(&state.db, events.clone()).await?;
    info!(
        n_requests = events.len(),
        "import transactions events appended"
    );

    // Spawn background jobs running transaction process managers.
    events.iter().for_each(|event| {
        if let Event::ImportTransactionsRequested(data) = &event
            && let Some(session) = valid_sessions
                .iter()
                .find(|session_data| session_data.session_id == data.session_id)
        {
            tokio::spawn(run_transaction_import(
                state.db.clone(),
                session.to_owned(),
                data.request_id,
            ));
        }
    });

    Ok((
        StatusCode::ACCEPTED,
        "Transactions import requested!".to_string(),
    ))
}

#[derive(Deserialize)]
pub struct TransactionImportRetryPayload {
    pub request_id: String,
    pub session_id: i64,
}

/// Handler for POST request to /transactions/import/retry
///
/// If a retry request event is successfully created, transaction process manager
/// will be spawn and run the import in the background.
///
/// # Errors
///
/// Return [`AppError`] in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Command is rejected by the aggregate.
/// - Failed to insert the new event into the store.
#[instrument(
    skip(state, payload),
    fields(
        request_id = payload.request_id
    )
)]
pub async fn transaction_import_retry_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<TransactionImportRetryPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let session_data = get_session_by_id(&state.db, payload.session_id).await?;

    let command =
        Command::create_retry_failed_import_request(&payload.request_id, payload.session_id)?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone()).await?;
    info!(event_id = %res.last_insert_id, "transaction import retry event appended");

    // Spawn a background job running transaction process manager.
    if let Event::TransactionImportRetryRequested(data) = &event {
        tokio::spawn(run_transaction_import(
            state.db.clone(),
            session_data,
            data.request_id,
        ));
    }

    Ok((
        StatusCode::ACCEPTED,
        "Transaction import retry requested!".to_string(),
    ))
}

#[derive(Deserialize)]
pub struct CategorizeTransactionPayload {
    pub transaction_id: String,
    pub category: String,
}

/// Handler for POST request to /transactions/category
///
/// # Errors
///
/// Returns [`AppError`] in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Command is rejected by the aggregate.
/// - Failed to insert the new event into the store.
#[instrument(
    skip(state, payload),
    fields(
        transaction_id = payload.transaction_id,
        category = payload.category
    )
)]
pub async fn categorize_transaction_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CategorizeTransactionPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let command =
        Command::create_categorize_transaction(&payload.transaction_id, &payload.category)?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone()).await?;
    info!(event_id = %res.last_insert_id, "categorize transaction event appended");

    Ok((StatusCode::CREATED, "Transaction categorized!".to_string()))
}

#[derive(Deserialize)]
pub struct ClassifyTransactionPayload {
    pub transaction_id: String,
    pub classification: String,
}

/// Handler for POST request to /transactions/classification
///
/// # Errors
///
/// Returns [`AppError`] in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Command is rejected by the aggregate.
/// - Failed to insert the new event into the store.
#[instrument(
    skip(state, payload),
    fields(
        transaction_id = payload.transaction_id,
        classification = payload.classification
    )
)]
pub async fn classify_transaction_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ClassifyTransactionPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let command =
        Command::create_classify_transaction(&payload.transaction_id, &payload.classification)?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone()).await?;
    info!(event_id = %res.last_insert_id, "classify transaction event appended");

    Ok((StatusCode::CREATED, "Transaction classified!".to_string()))
}

#[derive(Deserialize)]
pub struct UpdateTransactionNotePayload {
    pub transaction_id: String,
    pub note: String,
}

/// Handler for POST request to /transactions/note
///
/// # Errors
///
/// Returns [`AppError`] in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Command is rejected by the aggregate.
/// - Failed to insert the new event into the store.
#[instrument(
    skip(state, payload),
    fields(
        transaction_id = payload.transaction_id,
        note = payload.note,
    )
)]
pub async fn update_transaction_note_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdateTransactionNotePayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let command = Command::create_update_transaction_note(&payload.transaction_id, &payload.note)?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone()).await?;
    info!(event_id = %res.last_insert_id, "update transaction note event appended");

    Ok((StatusCode::CREATED, "Transaction note updated!".to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use domain::events::{
        Event,
        transactions::{
            ImportRequestData,
            ImportStatusData,
        },
    };
    use gateway::schema::enable_banking_session::EnableBankingSession;
    use infra::{
        append_event_to_db,
        append_multi_events_to_db,
        create_new_session,
        get_all_events,
        sync_database_schema,
    };
    use sea_orm::Database;
    use uuid::Uuid;

    use crate::AppState;

    /// A representative valid session.
    const MOCK_SESSION: &str = r#"{
        "session_id": "sess-123",
        "accounts": [
            {"name": "Checking", "currency": "EUR", "uid": "acc-uid-1"},
            {"name": null, "currency": "EUR", "uid": "acc-uid-2"}
        ],
        "aspsp": {"name": "Mock Bank", "country": "FI"},
        "psu_type": "personal",
        "access": {"valid_until": "2026-12-31T23:59:59Z"}
    }"#;

    /// A representative expired session.
    const MOCK_EXPIRED_SESSION: &str = r#"{
        "session_id": "sess-123",
        "accounts": [
            {"name": "Checking", "currency": "EUR", "uid": "acc-uid-1"},
            {"name": null, "currency": "EUR", "uid": "acc-uid-2"}
        ],
        "aspsp": {"name": "Mock Bank", "country": "FI"},
        "psu_type": "personal",
        "access": {"valid_until": "2020-12-31T23:59:59Z"}
    }"#;

    /// Build an in-memory event store.
    async fn in_memory_state() -> Arc<AppState> {
        let db = Database::connect("sqlite::memory:").await.unwrap();
        sync_database_schema(&db).await.unwrap();
        create_new_session(
            &db,
            "mock-session".to_string(),
            EnableBankingSession::from_json(MOCK_SESSION).unwrap(),
        )
        .await
        .unwrap();
        Arc::new(AppState { db })
    }

    /// Build an in-memory event store with expired session.
    async fn in_memory_state_with_expired_session() -> Arc<AppState> {
        let db = Database::connect("sqlite::memory:").await.unwrap();
        sync_database_schema(&db).await.unwrap();
        create_new_session(
            &db,
            "mock-expired-session".to_string(),
            EnableBankingSession::from_json(MOCK_EXPIRED_SESSION).unwrap(),
        )
        .await
        .unwrap();
        Arc::new(AppState { db })
    }

    #[tokio::test]
    async fn test_import_transactions_handler() {
        let state = in_memory_state().await;

        let response = import_transactions_handler(
            State(state.clone()),
            Json(ImportTransactionsPayload {
                start_date: None,
                end_date: None,
            }),
        )
        .await;

        let Ok((status, body)) = response else {
            panic!("Expected import_transactions_handler to succeed. Got {response:#?} instead.");
        };
        assert_eq!(status, StatusCode::ACCEPTED);
        assert_eq!(body, "Transactions import requested!".to_string());

        let events = wait_for_events(&state.db, 2).await;
        let requested = events
            .iter()
            .filter(|event| matches!(event, Event::ImportTransactionsRequested(_)))
            .count();
        let failed = events
            .iter()
            .filter(|event| matches!(event, Event::ImportTransactionsFailed(_)))
            .count();
        assert_eq!(
            requested, 1,
            "handler should append exactly one ImportTransactionsRequested event"
        );
        assert_eq!(
            failed, 1,
            "spawned background import should record exactly one failure for an invalid session"
        );
    }

    #[tokio::test]
    async fn test_transaction_import_retry_handler_accepts_known_failed_request() {
        let state = in_memory_state().await;

        // Seed a request that has already failed, making it eligible for retry.
        // The aggregate marks a request retryable from the failure event alone.
        let request_id = Uuid::new_v4();
        let session_id = 1;
        append_multi_events_to_db(
            &state.db,
            vec![
                Event::ImportTransactionsRequested(ImportRequestData {
                    request_id,
                    session_id,
                    ..Default::default()
                }),
                Event::ImportTransactionsFailed(ImportStatusData {
                    request_id,
                    session_id,
                }),
            ],
        )
        .await
        .unwrap();

        let response = transaction_import_retry_handler(
            State(state.clone()),
            Json(TransactionImportRetryPayload {
                request_id: request_id.to_string(),
                session_id,
            }),
        )
        .await;

        let Ok((status, body)) = response else {
            panic!("expected transaction_import_retry_handler to succeed");
        };
        assert_eq!(status, StatusCode::ACCEPTED);
        assert_eq!(body, "Transaction import retry requested!".to_string());

        // Seeded failure, plus the appended retry-requested event, plus a second
        // failure from the spawned background import (the session is invalid).
        let events = wait_for_events(&state.db, 3).await;
        let retry_requested = events
            .iter()
            .filter(|event| matches!(event, Event::TransactionImportRetryRequested(_)))
            .count();
        assert_eq!(
            retry_requested, 1,
            "handler should append exactly one TransactionImportRetryRequested event"
        );
    }

    #[tokio::test]
    async fn test_transaction_import_retry_handler_rejects_unknown_request() {
        let state = in_memory_state().await;

        // No prior failure exists, so the aggregate rejects the retry command.
        let response = transaction_import_retry_handler(
            State(state.clone()),
            Json(TransactionImportRetryPayload {
                request_id: Uuid::new_v4().to_string(),
                session_id: 1,
            }),
        )
        .await;

        assert!(
            response.is_err(),
            "retrying an unknown request must be rejected"
        );
        let events = get_all_events(&state.db).await.unwrap();
        assert!(
            events.is_empty(),
            "a rejected retry must not append any events"
        );
    }

    #[tokio::test]
    async fn test_transaction_import_retry_handler_rejects_invalid_request_id() {
        let state = in_memory_state().await;

        // A malformed request id fails command creation before touching the store.
        let response = transaction_import_retry_handler(
            State(state.clone()),
            Json(TransactionImportRetryPayload {
                request_id: "not-a-uuid".to_string(),
                session_id: 1,
            }),
        )
        .await;

        assert!(response.is_err(), "a malformed request id must be rejected");
        let events = get_all_events(&state.db).await.unwrap();
        assert!(
            events.is_empty(),
            "a rejected retry must not append any events"
        );
    }

    #[tokio::test]
    async fn test_transaction_import_retry_handler_rejects_when_request_pending() {
        let state = in_memory_state().await;

        // A previously failed request is, on its own, eligible for retry.
        let failed_id = Uuid::new_v4();
        let session_id = 1;

        append_multi_events_to_db(
            &state.db,
            vec![
                Event::ImportTransactionsRequested(ImportRequestData {
                    request_id: failed_id,
                    session_id,
                    ..Default::default()
                }),
                Event::ImportTransactionsFailed(ImportStatusData {
                    request_id: failed_id,
                    session_id,
                }),
            ],
        )
        .await
        .unwrap();

        // Seed a fresh, still-pending import. Building it through the domain API
        // (rather than the handler) keeps the pending state deterministic, since
        // no background job is spawned to race in a terminal event.
        let pending = CoreAggregate::new(&[])
            .execute(
                Command::create_import_transactions(None, None, vec![session_id])
                    .unwrap()
                    .into_iter()
                    .next()
                    .unwrap(),
            )
            .unwrap();
        append_event_to_db(&state.db, pending).await.unwrap();

        // Retrying the failed request must be rejected because another request is
        // pending, even though that request id is itself retryable.
        let response = transaction_import_retry_handler(
            State(state.clone()),
            Json(TransactionImportRetryPayload {
                request_id: failed_id.to_string(),
                session_id,
            }),
        )
        .await;

        assert!(
            response.is_err(),
            "a retry must be rejected while another request is pending"
        );

        // Only the two seeded events remain; the rejected retry appended nothing.
        let events = get_all_events(&state.db).await.unwrap();
        assert_eq!(
            events.len(),
            3,
            "a rejected retry must not append any events"
        );
        let retry_requested = events
            .iter()
            .filter(|event| matches!(event, Event::TransactionImportRetryRequested(_)))
            .count();
        assert_eq!(
            retry_requested, 0,
            "a rejected retry must not append a retry-requested event"
        );
    }

    #[tokio::test]
    async fn test_transaction_import_hanlder_rejects_when_session_expires() {
        let state = in_memory_state_with_expired_session().await;
        let response = import_transactions_handler(
            State(state.clone()),
            Json(ImportTransactionsPayload {
                start_date: None,
                end_date: None,
            }),
        )
        .await;
        assert!(
            response.is_err(),
            "an import request must be rejected if the session has expired!"
        );
    }

    #[tokio::test]
    async fn test_transaction_retry_import_hanlder_rejects_when_session_expires() {
        let state = in_memory_state_with_expired_session().await;
        let response = transaction_import_retry_handler(
            State(state.clone()),
            Json(TransactionImportRetryPayload {
                request_id: "this-does-not-matter".to_string(),
                session_id: 1,
            }),
        )
        .await;
        assert!(
            response.is_err(),
            "a retry request must be rejected if the session has expired!"
        );
    }

    /// Helper function to poll the event store table.
    async fn wait_for_events(db: &infra::DatabaseConnection, expected: usize) -> Vec<Event> {
        for _ in 0..50 {
            let events = get_all_events(db).await.unwrap();
            if events.len() >= expected {
                return events;
            }
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;
        }

        get_all_events(db).await.unwrap()
    }
}
