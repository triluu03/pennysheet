//! Run projections

use std::time::Duration;

use infra::{
    DatabaseConnection,
    get_user_settings,
    projections,
    projectors::{
        CoreProjector,
        ProjectorTrait,
    },
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
        let mut projector = CoreProjector::new(db.to_owned()).await?;
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

/// Apply the user settings to the whole expenses projection.
///
/// # Panics
///
/// Panic in any of the following scenarios:
/// - Cannot query the user settings from the table.
/// - Applying the user settings fails.
#[instrument(skip(db))]
pub async fn apply_user_settings_to_expenses(db: DatabaseConnection) {
    info!("getting all user settings");
    let user_settings = get_user_settings(&db)
        .await
        .expect("querying user settings from the database should succeed!");

    // TODO: make this go through a transaction.
    info!("applying user settings to the expenses projection");
    projections::expenses::apply_user_settings_all(&db, &user_settings)
        .await
        .expect("apply user settings to the expenses projection should succeed");

    info!("expenses projection updated!");
}
