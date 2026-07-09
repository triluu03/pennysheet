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
