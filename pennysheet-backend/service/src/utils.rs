//! Utility functions.

use crate::errors::{
    Result,
    ServiceError,
};
#[cfg(test)]
use infra::DatabaseConnection;
use serde::Serialize;

/// Serialize a value into a JSON [`serde_json::Value`].
///
/// # Errors
///
/// Returns [`ServiceError::Serialization`] if serialization fails.
pub(crate) fn to_json_value<T: Serialize>(value: T) -> Result<serde_json::Value> {
    serde_json::to_value(value).map_err(|err| ServiceError::Serialization(err.to_string()))
}

/// Build an in-memory database with the Pennysheet schema synced.
#[cfg(test)]
pub(crate) async fn in_memory_db() -> DatabaseConnection {
    let db = sea_orm::Database::connect("sqlite::memory:").await.unwrap();
    infra::sync_database_schema(&db).await.unwrap();
    db
}
