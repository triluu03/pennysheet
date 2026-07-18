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
    SessionMetadata,
    create_new_session,
    delete_session,
    get_all_sessions_metadata,
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
    pub valid_sessions: Vec<SessionMetadata>,
    pub expired_sessions: Vec<SessionMetadata>,
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
    let (valid_sessions, expired_sessions) = get_all_sessions_metadata(&state.db).await?;

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
) -> axum::response::Result<Json<SessionMetadata>, AppError> {
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

#[cfg(test)]
mod tests {
    use std::sync::Arc;
    use axum::{
        Json,
        extract::State,
    };
    use sea_orm::Database;

    use crate::AppState;
    use super::{
        ImportSessionPayload,
        create_sessions_handler,
        delete_sessions_handler,
        get_sessions_handler,
    };

    const MOCK_SESSION: &str = r#"{
        "session_id": "sess-123",
        "accounts": [
            {"name": "Checking", "currency": "EUR", "uid": "acc-uid-1"}
        ],
        "aspsp": {"name": "Mock Bank", "country": "FI"},
        "psu_type": "personal",
        "access": {"valid_until": "2026-12-31T23:59:59Z"}
    }"#;

    /// Build an empty in-memory app state with schema synced.
    async fn in_memory_state() -> Arc<AppState> {
        let db = Database::connect("sqlite::memory:").await.unwrap();
        infra::sync_database_schema(&db).await.unwrap();
        Arc::new(AppState { db })
    }

    /// Getting sessions with no stored rows returns empty valid and expired lists.
    #[tokio::test]
    async fn get_sessions_handler_returns_empty_lists_when_no_sessions() {
        let state = in_memory_state().await;
        let response = get_sessions_handler(State(state)).await.unwrap();
        assert!(response.valid_sessions.is_empty());
        assert!(response.expired_sessions.is_empty());
    }

    /// Creating a session with valid JSON returns the new session metadata.
    #[tokio::test]
    async fn create_sessions_handler_succeeds_with_valid_payload() {
        let state = in_memory_state().await;
        let payload = ImportSessionPayload {
            name: "test-session".to_string(),
            session: MOCK_SESSION.to_string(),
        };
        let response = create_sessions_handler(State(state), Json(payload))
            .await
            .unwrap();
        assert_eq!(response.session_name, "test-session");
        assert!(response.session_id > 0);
    }

    /// Creating a session with invalid JSON is rejected.
    #[tokio::test]
    async fn create_sessions_handler_rejects_invalid_session_json() {
        let state = in_memory_state().await;
        let payload = ImportSessionPayload {
            name: "bad".to_string(),
            session: "{ not valid json".to_string(),
        };
        let result = create_sessions_handler(State(state), Json(payload)).await;
        assert!(result.is_err());
    }

    /// Deleting an existing session returns no content.
    #[tokio::test]
    async fn delete_sessions_handler_succeeds_for_existing_session() {
        let state = in_memory_state().await;
        // First create a session.
        let payload = ImportSessionPayload {
            name: "test".to_string(),
            session: MOCK_SESSION.to_string(),
        };
        let created = create_sessions_handler(State(state.clone()), Json(payload))
            .await
            .unwrap();
        // Then delete it.
        let status =
            delete_sessions_handler(State(state), axum::extract::Path(created.session_id))
                .await
                .unwrap();
        assert_eq!(status, axum::http::StatusCode::NO_CONTENT);
    }

    /// Deleting a missing session surfaces a database/not-found error.
    #[tokio::test]
    async fn delete_sessions_handler_rejects_missing_session() {
        let state = in_memory_state().await;
        let result = delete_sessions_handler(State(state), axum::extract::Path(999)).await;
        assert!(result.is_err());
    }

    /// Getting sessions partitions valid and expired rows.
    #[tokio::test]
    async fn get_sessions_handler_partitions_valid_and_expired_sessions() {
        let state = in_memory_state().await;
        // Create a valid (far-future) session.
        let valid_payload = ImportSessionPayload {
            name: "valid".to_string(),
            session: MOCK_SESSION.to_string(),
        };
        let _ = create_sessions_handler(State(state.clone()), Json(valid_payload))
            .await
            .unwrap();
        // Create an expired session.
        const EXPIRED_SESSION: &str = r#"{
            "session_id": "sess-exp",
            "accounts": [{"name": "Old", "currency": "EUR", "uid": "acc-1"}],
            "aspsp": {"name": "Bank", "country": "FI"},
            "psu_type": "personal",
            "access": {"valid_until": "2020-01-01T00:00:00Z"}
        }"#;
        let expired_payload = ImportSessionPayload {
            name: "expired".to_string(),
            session: EXPIRED_SESSION.to_string(),
        };
        let _ = create_sessions_handler(State(state.clone()), Json(expired_payload))
            .await
            .unwrap();
        // Now get sessions and assert partition.
        let response = get_sessions_handler(State(state)).await.unwrap();
        assert_eq!(response.valid_sessions.len(), 1);
        assert_eq!(response.expired_sessions.len(), 1);
    }
}
