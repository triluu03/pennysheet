//! Run projections

use std::time::Duration;

use infra::{
    DatabaseConnection,
    get_user_settings,
    projections::{
        self,
        AutoUserSettingTrait,
    },
    projectors::{
        CoreProjector,
        ImportRequestProjector,
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
#[instrument(skip(db), fields(projector = "CoreProjector"))]
pub async fn spawn_and_subscribe_core_projector(db: DatabaseConnection) {
    let closure_run_helper = async |db: &DatabaseConnection| {
        let mut projector = CoreProjector::new(db.to_owned()).await?;
        projector.listen_to_new_events().await
    };

    let mut retry_wait_time: u64 = 1; // seconds
    loop {
        match closure_run_helper(&db).await {
            Ok(()) => {
                info!("projector exited");
                return;
            },
            Err(error) => {
                error!(
                    %error,
                    retry_in = retry_wait_time,
                    "projector crashed, restarting"
                );
                tokio::time::sleep(Duration::from_secs(retry_wait_time)).await;
                retry_wait_time *= 2;
            },
        }
    }
}

/// Spawn the [`ImportRequestProjector`] to run in the background.
///
/// # Panics
///
/// Panic in any of the following scenarios:
/// - Cannot initialize the projector.
/// - Running the projections fails.
#[instrument(skip(db), fields(projector = "ImportRequestProjector"))]
// NOTE: this function all overlapping code (except the projector struct) with the above function.
// TODO: how not to repeat yourself here?
pub async fn spawn_and_subscribe_import_request_projector(db: DatabaseConnection) {
    let closure_run_helper = async |db: &DatabaseConnection| {
        let mut projector = ImportRequestProjector::new(db.to_owned()).await?;
        projector.listen_to_new_events().await
    };

    let mut retry_wait_time: u64 = 1; // seconds
    loop {
        match closure_run_helper(&db).await {
            Ok(()) => {
                info!("projector exited");
                return;
            },
            Err(error) => {
                error!(
                    %error,
                    retry_in = retry_wait_time,
                    "projector crashed, restarting"
                );
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
    let user_settings = get_user_settings(&db)
        .await
        .expect("querying user settings from the database should succeed!");

    // TODO: make this go through a transaction.
    info!(
        n_settings = user_settings.len(),
        "re-applying user settings to expenses projection"
    );
    projections::expenses::Entity::apply_user_settings_all(&db, &user_settings)
        .await
        .expect("apply user settings to the expenses projection should succeed");
}

// TODO: add tests for spawn_and_subscribe_core_projector,
// spawn_and_subscribe_import_request_projector, and apply_user_settings_to_expenses once Postgres
// projector fixtures are available without new dependencies.
