//! Axum router setup.

use axum::{
    Router,
    http::HeaderValue,
    routing::{
        get,
        patch,
        post,
    },
};
use std::sync::Arc;
use tower_http::{
    cors::{
        AllowOrigin,
        Any,
        CorsLayer,
    },
    trace::TraceLayer,
};

use crate::{
    AppState,
    handlers::{
        sessions::import_new_session_handler,
        transactions::{
            categorize_transaction_handler,
            classify_transaction_handler,
            get_one_transaction_handler,
            get_transactions_handler,
            get_transactions_time_aggregated_handler,
            import_transactions_handler,
            transaction_import_retry_handler,
            update_transaction_note_handler,
        },
        user_settings::{
            create_user_settings_handler,
            delete_user_settings_handler,
            get_user_settings_handler,
            update_user_settings_handler,
        },
    },
};

fn transactions_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(get_transactions_handler))
        .route(
            "/aggregate/{aggregated_level}",
            get(get_transactions_time_aggregated_handler),
        )
        .route("/{transaction_id}", get(get_one_transaction_handler))
        .route("/import", post(import_transactions_handler))
        .route("/import/retry", post(transaction_import_retry_handler))
        .route("/category", post(categorize_transaction_handler))
        .route("/classification", post(classify_transaction_handler))
        .route("/note", post(update_transaction_note_handler))
}

fn user_settings_router() -> Router<Arc<AppState>> {
    Router::new()
        .route(
            "/",
            get(get_user_settings_handler).post(create_user_settings_handler),
        )
        .route(
            "/{setting_id}",
            patch(update_user_settings_handler).delete(delete_user_settings_handler),
        )
}

/// Define App router.
pub fn app_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/status", get(|| async { "Working fine!" }))
        .route("/sessions/import", post(import_new_session_handler))
        .nest("/transactions", transactions_router())
        .nest("/settings", user_settings_router())
        .layer(TraceLayer::new_for_http())
        .layer(
            CorsLayer::new()
                .allow_methods(Any)
                .allow_headers(Any)
                .allow_origin(AllowOrigin::predicate(|origin: &HeaderValue, _| {
                    origin
                        .to_str()
                        .map(|s| {
                            s.starts_with("http://localhost") || s.starts_with("http://127.0.0.1")
                        })
                        .unwrap_or(false)
                })),
        )
}
