//! Main entry-point of Pennysheet backend.

use infra::{
    DatabaseConnection,
    connect_to_database,
    ensure_append_only_eventstore,
    setup_new_event_notification,
    sync_database_schema,
};
use std::sync::Arc;
use tower_http::services::{
    ServeDir,
    ServeFile,
};
use tracing::info;

use crate::background_jobs::{
    scheduled_transaction_import,
    spawn_and_subscribe_budget_projector,
    spawn_and_subscribe_core_projector,
    spawn_and_subscribe_import_request_projector,
};

mod background_jobs;
mod errors;
mod handlers;
mod routes;
mod telemetry;

pub struct AppState {
    db: DatabaseConnection,
}

/// Main function of Axum application
///
/// # Panics
///
/// Panic in the following scenarios:
/// - Cannot install the global tracing subscriber.
/// - Cannot connect to database or sync database setup.
/// - Cannot serve the Axum application to the specified port.
#[tokio::main]
async fn main() {
    telemetry::init_tracing().expect("tracing subscriber should install once at startup");

    let db = connect_to_database().await.unwrap();
    info!("connected to database");

    sync_database_schema(&db).await.unwrap();
    info!("database schema synced");

    setup_new_event_notification(&db).await.unwrap();
    info!("event notifications online");

    ensure_append_only_eventstore(&db).await.unwrap();
    info!("append-only event store ensured");

    tokio::spawn(spawn_and_subscribe_core_projector(db.clone()));
    tokio::spawn(spawn_and_subscribe_import_request_projector(db.clone()));
    tokio::spawn(spawn_and_subscribe_budget_projector(db.clone()));
    info!("projectors spawned in the background");

    tokio::spawn(scheduled_transaction_import(db.clone()));
    info!("scheduled transactions import in the background");

    let app = routes::app_router()
        .with_state(Arc::new(AppState { db }))
        .fallback_service(
            ServeDir::new("dist").not_found_service(ServeFile::new("dist/index.html")),
        );

    let addr = if cfg!(debug_assertions) {
        "0.0.0.0:3000"
    } else {
        "0.0.0.0:49200"
    };
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    info!(%addr, "listening");
    axum::serve(listener, app).await.unwrap();
}
