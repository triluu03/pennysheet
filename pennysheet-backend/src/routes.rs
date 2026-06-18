//! Axum router setup.

use axum::{
    Router,
    routing::{
        get,
        post,
    },
};
use std::sync::Arc;
use tower_http::trace::TraceLayer;

use crate::{
    AppState,
    handlers::{
        import_transactions_handler,
        transaction_import_retry_handler,
    },
};

fn transactions_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/import", post(import_transactions_handler))
        .route("/import/retry", post(transaction_import_retry_handler))
}

/// Define App router.
pub fn app_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/status", get(|| async { "Working fine!" }))
        .nest("/transactions", transactions_router())
        .layer(TraceLayer::new_for_http())
}
