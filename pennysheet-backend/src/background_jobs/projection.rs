//! Run projections

use infra::{
    DatabaseConnection,
    projectors::CoreProjector,
};
use tracing::{
    info,
    instrument,
};

/// Run the projection.
///
/// # Panics
/// Panic in any of the following scenarios:
/// - Cannot initialize the projector.
/// - Running the projections fails.
#[instrument(skip(db))]
pub async fn run_projection(db: DatabaseConnection) {
    info!("running projections in the background");
    let projector = CoreProjector::new(&db).await.unwrap();
    projector.run_projections().await.unwrap();
    info!("projections completed!");
}
