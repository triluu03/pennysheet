//! Framework-agnostic shared services for the Pennysheet backend.

pub mod database;
pub mod errors;
pub mod services;
pub mod state;

mod utils;

pub use state::AppState;

pub use errors::{
    Result,
    ServiceError,
};
