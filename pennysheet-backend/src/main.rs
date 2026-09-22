//! Binary entry-point for the Axum REST API.

use infra::{
    connect_to_database,
    ensure_append_only_eventstore,
    projectors::{
        BudgetProjector,
        CoreProjector,
        ImportRequestProjector,
    },
    setup_new_event_notification,
    sync_database_schema,
};
use pennysheet_backend::{
    AppState,
    background_jobs::{
        scheduled_budget_reset,
        scheduled_budget_status_notification,
        scheduled_transaction_import,
        spawn_and_subscribe_projector,
    },
    routes::app_router,
    telemetry::init_tracing,
};
use std::sync::Arc;
use tower_http::services::{
    ServeDir,
    ServeFile,
};
use tracing::info;

/// Main function of Axum REST API.
///
/// # Panics
///
/// Panics in the following scenarios:
/// - Cannot install the global tracing subscriber.
/// - Cannot connect to the database or sync the database setup.
/// - Cannot bind the listener or serve the Axum application on the specified port.
#[tokio::main]
async fn main() {
    init_tracing().expect("tracing subscriber should install once at startup");

    let db = connect_to_database().await.unwrap();
    info!("connected to database");

    sync_database_schema(&db).await.unwrap();
    info!("database schema synced");

    setup_new_event_notification(&db).await.unwrap();
    info!("event notifications online");

    ensure_append_only_eventstore(&db).await.unwrap();
    info!("append-only event store ensured");

    tokio::spawn(spawn_and_subscribe_projector::<CoreProjector>(db.clone()));
    tokio::spawn(spawn_and_subscribe_projector::<ImportRequestProjector>(
        db.clone(),
    ));
    tokio::spawn(spawn_and_subscribe_projector::<BudgetProjector>(db.clone()));
    info!("projectors spawned in the background");

    tokio::spawn(scheduled_transaction_import(db.clone()));
    info!("scheduled transactions import in the background");

    tokio::spawn(scheduled_budget_reset(db.clone()));
    info!("scheduled budget reset in the background");

    tokio::spawn(scheduled_budget_status_notification(db.clone()));
    info!("scheduled daily budget status notification in the background");

    let app = app_router()
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
