//! Read-only session services shared by the REST API and the MCP server.

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

#[cfg(test)]
mod tests {
    use super::*;

    use crate::utils::in_memory_db;

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
}
