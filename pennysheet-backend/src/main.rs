//! Main entry-point of Pennysheet backend.

use infra::{
    DatabaseConnection,
    connect_to_database,
    ensure_append_only_eventstore,
    sync_database_schema,
};
use std::sync::Arc;

mod errors;
mod handlers;
mod routes;

pub struct AppState {
    db: DatabaseConnection,
}

/// Main function of Axum application
///
/// # Panics
/// Panic in the following scenarios:
/// - Cannot connect to database or sync database setup.
/// - Cannot serve the Axum application to the specified port.
#[tokio::main]
async fn main() {
    let db = connect_to_database().await.unwrap();
    sync_database_schema(&db).await.unwrap();
    ensure_append_only_eventstore(&db).await.unwrap();

    let app = routes::app_router().with_state(Arc::new(AppState { db }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
