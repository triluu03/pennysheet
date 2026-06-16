//! Tracing setup.

use tracing::Level;
use tracing_subscriber::{
    EnvFilter,
    fmt,
};

/// Init tracing subscriber.
///
/// # Errors
/// Returns [`String`] error when the initialization fails.
pub fn init_tracing() -> Result<(), String> {
    let filter = EnvFilter::from_default_env()
        .add_directive(Level::INFO.into())
        .add_directive(Level::DEBUG.into());

    fmt()
        .with_env_filter(filter)
        .with_target(true)
        .try_init()
        .map_err(|error| format!("failed to initialize tracing subscriber: {error}"))
}
