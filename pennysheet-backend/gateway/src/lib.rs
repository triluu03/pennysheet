//! Gateway to external services.

mod authorization;

#[cfg(feature = "with-client")]
pub mod client;

pub mod errors;
pub mod schema;
