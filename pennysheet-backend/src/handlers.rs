//! API handlers.

use axum::{
    Json,
    extract::State,
    http::StatusCode,
};
use domain::{
    aggregates::CoreAggregate,
    commands::create_new_import_transactions_command,
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
    errors::AppError,
    process_managers::run_transaction_import,
};

#[derive(Deserialize)]
pub struct ImportTransactionsPayload {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub session: String,
}

/// Handler for POST request to /transactions/import
///
/// If a import transaction request event is successfully created, transaction process manager
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
    let event = CoreAggregate::new()
        .multi_apply(&all_events)
        .execute(command)?;

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
            event.clone(),
        ));
    }

    Ok((
        StatusCode::CREATED,
        format!("Event created with ID: {}", res.last_insert_id),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use domain::events::Event;
    use infra::{
        get_all_events,
        sync_database_schema,
    };
    use sea_orm::Database;

    use crate::AppState;

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
        assert_eq!(status, StatusCode::CREATED);

        let inserted_id = body
            .strip_prefix("Event created with ID: ")
            .expect("response body should contain the inserted event ID");
        assert!(!inserted_id.is_empty());

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
