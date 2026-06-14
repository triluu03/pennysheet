//! Axum router setup.

use crate::{
    AppState,
    api::handlers::import_transactions_handler,
};
use axum::{
    Router,
    routing::{
        get,
        post,
    },
};
use std::sync::Arc;

fn transactions_router() -> Router<Arc<AppState>> {
    Router::new().route("/import", post(import_transactions_handler))
}

/// Define App router.
pub fn app_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/status", get(|| async { "Working fine!" }))
        .nest("/transactions", transactions_router())
}
