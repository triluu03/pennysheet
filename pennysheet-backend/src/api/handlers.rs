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
    domain::{
        aggregates::CoreAggregate,
        commands::create_new_import_transactions_command,
    },
    infra::append_event_to_db,
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
    let event = CoreAggregate::new().execute(command)?;
    let res = append_event_to_db(&state.db, event)
        .await
        .map_err(AppError::from)?;

    Ok((
        StatusCode::CREATED,
        format!("Event created with ID: {}", res.last_insert_id),
    ))
}
