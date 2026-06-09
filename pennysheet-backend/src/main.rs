use std::sync::Arc;

use sea_orm::DatabaseConnection;

use crate::infra::{
    connect_to_database,
    sync_database_schema,
};

mod api;
mod domain;
mod gateway;
mod infra;

pub struct AppState {
    db: DatabaseConnection,
}

/// Main function of Axum application
///
/// # Panics
/// Panic in the following scenarios:
/// - Cannot connect to database.
/// - Cannot serve the Axum application to the specified port.
#[tokio::main]
async fn main() {
    let db = connect_to_database().await.unwrap();
    sync_database_schema(&db).await.unwrap();

    let app = api::routes::app_router().with_state(Arc::new(AppState { db }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
