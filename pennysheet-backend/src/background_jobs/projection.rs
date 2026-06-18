//! Run projections

use infra::{
    DatabaseConnection,
    projectors::CoreProjector,
};
use tracing::instrument;

/// Spawn the [`CoreProjector`] to run in the background.
///
/// # Panics
///
/// Panic in any of the following scenarios:
/// - Cannot initialize the projector.
/// - Running the projections fails.
#[instrument(skip(db))]
pub async fn spawn_and_subscribe_core_projector(db: DatabaseConnection) {
    let mut projector = CoreProjector::new(&db).await.unwrap();
    projector.listen_to_new_events().await.unwrap();
}
