//! Import requests metadata handlers.

use axum::{
    Json,
    extract::State,
};
use infra::projections::import_requests;
use std::sync::Arc;
use tracing::{
    info,
    instrument,
};

use crate::{
    AppState,
    errors::AppError,
};

/// Handler for GET request to /import_requests
///
/// # Errors
///
/// Returns [`AppError`] if querying the import requests metadata fails.
#[instrument(skip(state))]
// TODO: write tests for this handler!
pub async fn get_import_requests_handler(
    State(state): State<Arc<AppState>>,
) -> axum::response::Result<Json<Vec<import_requests::Model>>, AppError> {
    info!("getting user settings");
    import_requests::get_import_requests(&state.db)
        .await
        .map(Json)
        .map_err(AppError::from)
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;
    use axum::extract::State;
    use sea_orm::Database;

    use crate::AppState;
    use super::get_import_requests_handler;

    /// Build an empty in-memory app state with schema synced.
    async fn in_memory_state() -> Arc<AppState> {
        let db = Database::connect("sqlite::memory:").await.unwrap();
        infra::sync_database_schema(&db).await.unwrap();
        Arc::new(AppState { db })
    }

    /// Getting import requests with no stored rows returns an empty list.
    #[tokio::test]
    async fn get_import_requests_handler_returns_empty_list_when_none_exist() {
        let state = in_memory_state().await;
        let response = get_import_requests_handler(State(state)).await.unwrap();
        assert!(response.is_empty());
    }
}
