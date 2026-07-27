//! Run projections

use infra::{
    DatabaseConnection,
    get_user_settings,
    projections::{
        self,
        AutoUserSettingTrait,
    },
    projectors::ProjectorTrait,
};
use std::time::Duration;
use tracing::{
    error,
    info,
    instrument,
};

/// Spawn a projector to run in the background, retrying with exponential backoff on failure.
///
/// # Panics
///
/// Panic in any of the following scenarios:
/// - Cannot initialize the projector.
/// - Running the projections fails.
#[instrument(skip(db), fields(projector = %P::projector_name()))]
pub async fn spawn_and_subscribe_projector<P: ProjectorTrait + Send>(db: DatabaseConnection) {
    let mut retry_wait_time: u64 = 1; // seconds
    loop {
        let result = async {
            let mut projector = P::new(db.clone()).await?;
            projector.listen_to_new_events().await
        }
        .await;
        match result {
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
pub async fn apply_user_settings_to_projections(db: DatabaseConnection) {
    let user_settings = get_user_settings(&db)
        .await
        .expect("querying user settings from the database should succeed!");

    // TODO: make this go through a transaction.
    info!(
        n_settings = user_settings.len(),
        "re-applying user settings to projections"
    );
    projections::expenses::Entity::apply_user_settings_all(&db, &user_settings)
        .await
        .expect("apply user settings to the expenses projection should succeed");
    projections::weekly_budgets::Entity::apply_user_settings_all(&db, &user_settings)
        .await
        .expect("apply user settings to the weekly budget projection should succeed");
    projections::monthly_budgets::Entity::apply_user_settings_all(&db, &user_settings)
        .await
        .expect("apply user settings to the monthly budget projection should succeed");
}

// TODO: add tests for spawn_and_subscribe_projector and
// apply_user_settings_to_projections once Postgres projector fixtures
// are available without new dependencies.
