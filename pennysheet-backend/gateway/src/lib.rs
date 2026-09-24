//! Gateway to external services.

#[cfg(feature = "with-client")]
mod authorization;

#[cfg(feature = "with-client")]
pub mod client;

pub mod errors;
pub mod schema;
