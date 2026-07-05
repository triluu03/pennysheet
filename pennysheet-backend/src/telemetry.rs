//! Tracing setup.

use tracing::Level;
use tracing_subscriber::{
    EnvFilter,
    fmt,
};

/// Init tracing subscriber.
///
/// # Errors
///
/// Returns [`String`] error when the initialization fails.
pub fn init_tracing() -> Result<(), String> {
    let filter = EnvFilter::from_default_env()
        //.add_directive(Level::DEBUG.into())
        .add_directive(Level::INFO.into())
        .add_directive(
            "sqlx=warn"
                .parse()
                .map_err(|error| format!("failed to parse sqlx tracing directive: {}", error))?,
        );

    fmt()
        .with_env_filter(filter)
        .with_target(cfg!(debug_assertions))
        .with_ansi(cfg!(debug_assertions))
        .try_init()
        .map_err(|error| format!("failed to initialize tracing subscriber: {error}"))
}
