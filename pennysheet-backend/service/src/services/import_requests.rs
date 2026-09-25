//! Read-only import request services shared by the REST API and the MCP server.

use infra::DatabaseConnection;

use crate::errors::Result;

/// List all import request projections.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the query fails.
pub async fn list_import_requests(
    db: &DatabaseConnection,
) -> Result<Vec<infra::projections::import_requests::Model>> {
    Ok(infra::projections::import_requests::get_import_requests(db).await?)
}

#[cfg(test)]
mod tests {
    use super::*;

    use crate::utils::in_memory_db;

    /// Listing import requests against an empty database returns an empty list.
    #[tokio::test]
    async fn list_import_requests_returns_empty_for_empty_db() {
        let db = in_memory_db().await;

        let requests = list_import_requests(&db).await.unwrap();

        assert!(requests.is_empty());
    }
}
