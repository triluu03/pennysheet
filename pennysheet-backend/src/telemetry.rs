//! Tracing setup.

use tracing_subscriber::{
    EnvFilter,
    fmt,
};

/// Init tracing subscriber.
///
/// # Errors
/// Returns [`String`] error when the initialization fails.
pub fn init_tracing() -> Result<(), String> {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        EnvFilter::new(
            "info,pennysheet_backend=debug,domain=debug,gateway=debug,infra=debug,tower_http=debug",
        )
    });

    fmt()
        .with_env_filter(filter)
        .with_target(true)
        .try_init()
        .map_err(|error| format!("failed to initialize tracing subscriber: {error}"))
}
