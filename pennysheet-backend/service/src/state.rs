//! Shared application state.

/// Shared application state.
#[derive(Clone)]
pub struct AppState {
    /// Database connection.
    pub db: infra::DatabaseConnection,
}
