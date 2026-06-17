//! API handlers.

use axum::{
    Json,
    extract::State,
    http::StatusCode,
};
use domain::{
    aggregates::CoreAggregate,
    commands::{
        create_new_import_transactions_command,
        create_retry_failed_import_request_command,
    },
    events::Event,
};
use infra::{
    append_event_to_db,
    get_all_events,
};
use serde::Deserialize;
use std::sync::Arc;
use tracing::{
    debug,
    info,
    instrument,
};

use crate::{
    AppState,
    background_jobs::run_transaction_import,
    errors::AppError,
};

#[derive(Deserialize)]
pub struct ImportTransactionsPayload {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub session: String,
}

/// Handler for POST request to /transactions/import
///
/// If an import transaction request event is successfully created, transaction process manager
/// will be spawn and run the import in the background.
///
/// # Errors
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
    let command = create_new_import_transactions_command(
        payload.start_date.as_deref(),
        payload.end_date.as_deref(),
    )?;
    debug!("import transactions command built");

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone())
        .await
        .map_err(AppError::from)?;

    info!(inserted_id = %res.last_insert_id, "import transactions event appended");

    // Spawn a background job running transaction process manager.
    if let Event::ImportTransactionsRequested(data) = &event {
        tokio::spawn(run_transaction_import(
            state.db.clone(),
            payload.session,
            data.request_id,
        ));
    }

    Ok((
        StatusCode::ACCEPTED,
        "Transactions import requested!".to_string(),
    ))
}

#[derive(Deserialize)]
pub struct TransactionImportRetryPayload {
    pub request_id: String,
    pub session: String,
}

/// Handler for POST request to /transactions/import/retry
///
/// If a retry request event is successfully created, transaction process manager
/// will be spawn and run the import in the background.
///
/// # Errors
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
    let command = create_retry_failed_import_request_command(&payload.request_id)?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone())
        .await
        .map_err(AppError::from)?;

    info!(inserted_id = %res.last_insert_id, "transaction import retry event appended");

    // Spawn a background job running transaction process manager.
    if let Event::TransactionImportRetryRequested(data) = &event {
        tokio::spawn(run_transaction_import(
            state.db.clone(),
            payload.session,
            data.request_id,
        ));
    }

    Ok((
        StatusCode::ACCEPTED,
        "Transaction import retry requested!".to_string(),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use domain::events::{
        Event,
        transactions::ImportStatusData,
    };
    use infra::{
        append_event_to_db,
        get_all_events,
        sync_database_schema,
    };
    use sea_orm::Database;
    use uuid::Uuid;

    use crate::AppState;

    /// Build an in-memory event store with the schema applied, ready for handler tests.
    async fn in_memory_state() -> Arc<AppState> {
        let db = Database::connect("sqlite::memory:").await.unwrap();
        sync_database_schema(&db).await.unwrap();
        Arc::new(AppState { db })
    }

    #[tokio::test]
    async fn test_import_transactions_handler() {
        let db = Database::connect("sqlite::memory:").await.unwrap();
        sync_database_schema(&db).await.unwrap();

        let state = Arc::new(AppState { db });

        let response = import_transactions_handler(
            State(state.clone()),
            Json(ImportTransactionsPayload {
                start_date: None,
                end_date: None,
                session: String::new(),
            }),
        )
        .await;

        let Ok((status, body)) = response else {
            panic!("expected import_transactions_handler to succeed");
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
        append_event_to_db(
            &state.db,
            Event::ImportTransactionsFailed(ImportStatusData { request_id }),
        )
        .await
        .unwrap();

        let response = transaction_import_retry_handler(
            State(state.clone()),
            Json(TransactionImportRetryPayload {
                request_id: request_id.to_string(),
                session: String::new(),
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
                session: String::new(),
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
                session: String::new(),
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
