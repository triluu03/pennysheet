//! Sessions handlers.

use axum::{
    Json,
    extract::{
        Path,
        State,
    },
    http::StatusCode,
};
use gateway::schema::enable_banking_session::EnableBankingSession;
use infra::{
    SessionResult,
    create_new_session,
    delete_session,
    get_all_sessions,
};
use serde::{
    Deserialize,
    Serialize,
};
use std::sync::Arc;
use tracing::{
    info,
    instrument,
};

use crate::{
    AppState,
    errors::AppError,
};

#[derive(Deserialize)]
pub struct ImportSessionPayload {
    pub name: String,
    pub session: String,
}

#[derive(Serialize)]
pub struct GetSessionResponse {
    pub valid_sessions: Vec<SessionResult>,
    pub expired_sessions: Vec<SessionResult>,
}

/// Handler for GET request to /sessions
///
/// # Errors
///
/// Return [`AppError`] in the following scenarios:
/// - Failed to get all the sessions from the database.
#[instrument(skip(state))]
// TODO: write tests for this handler!
pub async fn get_sessions_handler(
    State(state): State<Arc<AppState>>,
) -> axum::response::Result<Json<GetSessionResponse>, AppError> {
    info!("getting all sessions");
    let (valid_sessions, expired_sessions) = get_all_sessions(&state.db).await?;

    Ok(Json(GetSessionResponse {
        valid_sessions,
        expired_sessions,
    }))
}

/// Handler for POST request to /sessions
///
/// # Errors
///
/// Return [`AppError`] in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Failed to parse the session from the payload into [`EnableBankingSession`].
/// - Failed to insert the new session into the database.
#[instrument(skip(state, payload), fields(session_name = ?payload.name))]
// TODO: write tests for this handler!
pub async fn create_sessions_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ImportSessionPayload>,
) -> axum::response::Result<Json<SessionResult>, AppError> {
    info!("creating new sessions");
    let session = EnableBankingSession::from_json(&payload.session)?;
    create_new_session(&state.db, payload.name, session)
        .await
        .map(Json)
        .map_err(AppError::from)
}

/// Handler for DELETE request to /sessions/{session_id}
///
/// # Errors
///
/// Return [`AppError`] in the following scenarios:
/// - Failed to parse the {session_id} into i64.
/// - Failed to delete the session from the database.
#[instrument(skip(state))]
// TODO: write tests for this handler!
pub async fn delete_sessions_handler(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<i64>,
) -> axum::response::Result<StatusCode, AppError> {
    info!("deleting Enable Banking sessions");
    delete_session(&state.db, session_id)
        .await
        .map(|_| StatusCode::NO_CONTENT)
        .map_err(AppError::from)
}
