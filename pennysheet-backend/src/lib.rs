//! Pennysheet backend library.

use infra::DatabaseConnection;

pub mod background_jobs;
pub mod errors;
pub mod handlers;
pub mod routes;
pub mod telemetry;

/// Shared application state.
pub struct AppState {
    /// Database connection.
    pub db: DatabaseConnection,
}
