//! Read-only user settings services shared by the REST API and the MCP server.

use infra::DatabaseConnection;

use crate::errors::Result;

/// List all user settings ordered by priority.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the query fails.
pub async fn list_settings(db: &DatabaseConnection) -> Result<Vec<infra::UserSettingsResult>> {
    Ok(infra::get_user_settings(db).await?)
}

#[cfg(test)]
mod tests {
    use super::*;

    use crate::utils::in_memory_db;

    /// Listing settings against an empty database returns an empty list.
    #[tokio::test]
    async fn list_settings_returns_empty_for_empty_db() {
        let db = in_memory_db().await;

        let settings = list_settings(&db).await.unwrap();

        assert!(settings.is_empty());
    }
}
