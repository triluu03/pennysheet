//! API handlers.

use std::sync::Arc;

use axum::{
    Json,
    extract::State,
    http::StatusCode,
};
use serde::Deserialize;

use crate::{
    AppState,
    api::errors::AppError,
    infra::{
        append_event_to_db,
        get_all_events,
    },
};
use domain::{
    aggregates::CoreAggregate,
    commands::create_new_import_transactions_command,
};

#[derive(Deserialize)]
pub struct ImportTransactionsPayload {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

/// Handler for POST request to /transactions/import
///
/// # Errors
/// Return AppError in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Command is rejected by the aggregate.
/// - Failed to insert the new event into the store.
pub async fn import_transactions_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ImportTransactionsPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let command = create_new_import_transactions_command(
        payload.start_date.as_deref(),
        payload.end_date.as_deref(),
    )?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new()
        .multi_apply(&all_events)
        .execute(command)?;

    let res = append_event_to_db(&state.db, event)
        .await
        .map_err(AppError::from)?;

    Ok((
        StatusCode::CREATED,
        format!("Event created with ID: {}", res.last_insert_id),
    ))
}

#[cfg(test)]
mod tests {
    use sea_orm::Database;

    use super::*;
    use crate::{
        AppState,
        infra::{
            get_all_events,
            sync_database_schema,
        },
    };
    use domain::events::Event;

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

        let events = get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0], Event::ImportTransactionsRequested(_)));

        // Another request failed.
        let response2 = import_transactions_handler(
            State(state.clone()),
            Json(ImportTransactionsPayload {
                start_date: None,
                end_date: None,
            }),
        )
        .await;
        assert!(matches!(response2, Err(AppError::Domain(_))));
    }
}
