//! Run projections

use std::time::Duration;

use infra::{
    DatabaseConnection,
    projectors::CoreProjector,
};
use tracing::{
    error,
    info,
    instrument,
};

/// Spawn the [`CoreProjector`] to run in the background.
///
/// # Panics
///
/// Panic in any of the following scenarios:
/// - Cannot initialize the projector.
/// - Running the projections fails.
#[instrument(skip(db))]
pub async fn spawn_and_subscribe_core_projector(db: DatabaseConnection) {
    let closure_run_helper = async |db: &DatabaseConnection| {
        let mut projector = CoreProjector::new(db).await?;
        projector.listen_to_new_events().await
    };

    let mut retry_wait_time: u64 = 1; // seconds
    loop {
        match closure_run_helper(&db).await {
            Ok(()) => {
                info!("projector exited!");
                return;
            },
            Err(error) => {
                error!(%error, retry_in = retry_wait_time, "projector crashed, restarting...");
                tokio::time::sleep(Duration::from_secs(retry_wait_time)).await;
                retry_wait_time *= 2;
            },
        }
    }
}
