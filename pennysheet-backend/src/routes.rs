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
        sessions::import_new_session_handler,
        transactions::{
            categorize_transaction_handler,
            classify_transaction_handler,
            import_transactions_handler,
            transaction_import_retry_handler,
            update_transaction_note_handler,
        },
    },
};

fn transactions_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/import", post(import_transactions_handler))
        .route("/import/retry", post(transaction_import_retry_handler))
        .route("/category", post(categorize_transaction_handler))
        .route("/classification", post(classify_transaction_handler))
        .route("/note", post(update_transaction_note_handler))
}

/// Define App router.
pub fn app_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/status", get(|| async { "Working fine!" }))
        .route("/sessions/import", post(import_new_session_handler))
        .nest("/transactions", transactions_router())
        .layer(TraceLayer::new_for_http())
}
