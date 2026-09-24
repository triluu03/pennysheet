//! Database bootstrap helpers.

use infra::DatabaseConnection;
use tracing::info;

use crate::errors::Result;

/// Connect to the database and prepare the schema and event store.
///
/// # Errors
///
/// Returns [`crate::errors::ServiceError::Database`] if any of the database steps fails.
pub async fn connect_and_prepare() -> Result<DatabaseConnection> {
    let db = infra::connect_to_database().await?;
    info!("connected to database");

    infra::sync_database_schema(&db).await?;
    info!("database schema synced");

    infra::setup_new_event_notification(&db).await?;
    info!("event notifications online");

    infra::ensure_append_only_eventstore(&db).await?;
    info!("append-only event store ensured");

    Ok(db)
}
