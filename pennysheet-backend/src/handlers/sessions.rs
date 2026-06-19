//! Sessions handlers.

use axum::{
    Json,
    extract::State,
    http::StatusCode,
};
use gateway::schema::enable_banking_session::EnableBankingSession;
use infra::insert_new_session;
use serde::Deserialize;
use std::sync::Arc;
use tracing::info;

use crate::{
    AppState,
    errors::AppError,
};

#[derive(Deserialize)]
pub struct ImportSessionPayload {
    pub session: String,
}

/// Handler for POST request to /sessions/import
///
/// # Errors
///
/// Return [`AppError`] in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Failed to parse the session from the payload into [`EnableBankingSession`].
/// - Failed to insert the new session into the database.
pub async fn import_new_session_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ImportSessionPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let session = EnableBankingSession::from_json(&payload.session)?;

    let res = insert_new_session(&state.db, session).await?;
    info!(session_id = %res.last_insert_id, "new session saved to the database");

    Ok((StatusCode::CREATED, "New session saved!".to_string()))
}
