//! Main entry-point of Pennysheet backend.

use infra::{
    DatabaseConnection,
    connect_to_database,
    ensure_append_only_eventstore,
    sync_database_schema,
};
use std::sync::Arc;
use tracing::info;

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

    ensure_append_only_eventstore(&db).await.unwrap();
    info!("append-only event store ensured");

    let app = routes::app_router().with_state(Arc::new(AppState { db }));

    let addr = "0.0.0.0:3000";
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    info!(%addr, "pennysheet backend listening");
    axum::serve(listener, app).await.unwrap();
}
