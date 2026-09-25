//! Session services shared by the REST API and the MCP server.

use gateway::schema::enable_banking_session::EnableBankingSession;
use infra::DatabaseConnection;

use crate::errors::Result;

/// Combined session data returned by [`list_sessions`].
#[derive(Debug, serde::Serialize)]
pub struct GetSessionResponse {
    /// Sessions whose Enable Banking access is still valid.
    pub valid_sessions: Vec<infra::SessionMetadata>,
    /// Sessions whose Enable Banking access has expired.
    pub expired_sessions: Vec<infra::SessionMetadata>,
}

/// List all stored sessions split into valid and expired buckets.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the query fails.
pub async fn list_sessions(db: &DatabaseConnection) -> Result<GetSessionResponse> {
    let (valid_sessions, expired_sessions) = infra::get_all_sessions_metadata(db).await?;

    Ok(GetSessionResponse {
        valid_sessions,
        expired_sessions,
    })
}

/// Create a new session from its raw JSON payload.
///
/// # Errors
///
/// Returns [`ServiceError::Gateway`] if the JSON payload cannot be parsed into an
/// [`EnableBankingSession`], or [`ServiceError::Database`] if the insert fails.
pub async fn create_session(
    db: &DatabaseConnection,
    name: String,
    session_json: String,
) -> Result<infra::SessionMetadata> {
    let session = EnableBankingSession::from_json(&session_json)?;
    Ok(infra::create_new_session(db, name, session).await?)
}

/// Delete a session by ID.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the delete fails or the session is not found.
pub async fn delete_session(db: &DatabaseConnection, session_id: i64) -> Result<()> {
    infra::delete_session(db, session_id).await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    use crate::{
        errors::ServiceError,
        utils::in_memory_db,
    };

    /// A session whose access is valid far in the future.
    const VALID_SESSION: &str = r#"{
        "session_id": "sess-valid",
        "accounts": [{"name": "Checking", "currency": "EUR", "uid": "acc-uid-1"}],
        "aspsp": {"name": "Mock Bank", "country": "FI"},
        "psu_type": "personal",
        "access": {"valid_until": "2999-12-31T23:59:59Z"}
    }"#;

    /// Listing sessions against an empty database returns empty valid and expired lists.
    #[tokio::test]
    async fn list_sessions_returns_empty_for_empty_db() {
        let db = in_memory_db().await;

        let response = list_sessions(&db).await.unwrap();

        assert!(response.valid_sessions.is_empty());
        assert!(response.expired_sessions.is_empty());
    }

    /// A seeded session is returned in the valid bucket.
    #[tokio::test]
    async fn list_sessions_returns_seeded_session() {
        let db = in_memory_db().await;

        let session =
            gateway::schema::enable_banking_session::EnableBankingSession::from_json(VALID_SESSION)
                .expect("valid session payload should parse");
        infra::create_new_session(&db, "test-session".to_string(), session)
            .await
            .unwrap();

        let response = list_sessions(&db).await.unwrap();

        assert_eq!(response.valid_sessions.len(), 1);
        assert!(response.expired_sessions.is_empty());
    }

    /// [`create_session`] succeeds with valid JSON and returns metadata.
    #[tokio::test]
    async fn create_session_succeeds_with_valid_json() {
        let db = in_memory_db().await;

        let metadata = create_session(&db, "test-session".to_string(), VALID_SESSION.to_string())
            .await
            .unwrap();

        assert_eq!(metadata.session_name, "test-session");
        assert!(metadata.session_id > 0);
    }

    /// [`create_session`] rejects invalid JSON.
    #[tokio::test]
    async fn create_session_rejects_invalid_json() {
        let db = in_memory_db().await;

        let result = create_session(&db, "bad".to_string(), "{ not valid json".to_string()).await;
        assert!(matches!(result, Err(ServiceError::Gateway(_))));
    }

    /// [`delete_session`] succeeds after a session is created.
    #[tokio::test]
    async fn delete_session_succeeds_after_create() {
        let db = in_memory_db().await;
        let metadata = create_session(&db, "test".to_string(), VALID_SESSION.to_string())
            .await
            .unwrap();

        delete_session(&db, metadata.session_id).await.unwrap();
    }

    /// [`delete_session`] rejects a missing session.
    #[tokio::test]
    async fn delete_session_rejects_missing_session() {
        let db = in_memory_db().await;

        assert!(matches!(
            delete_session(&db, 999).await,
            Err(ServiceError::Database(_))
        ));
    }
}
