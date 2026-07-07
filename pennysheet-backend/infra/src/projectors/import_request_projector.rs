//! Transaction Import request projector.

use domain::events::Event;
use sea_orm::{
    DatabaseConnection,
    DatabaseTransaction,
    DbErr,
    prelude::async_trait,
};
use tracing::instrument;

use crate::{
    UserSettingsResult,
    projectors::ProjectorTrait,
};

#[derive(Debug, Clone)]
pub struct ImportRequestProjector {
    db: DatabaseConnection,
    last_seen_event_number: i64,
    user_settings: Vec<UserSettingsResult>,
}

#[async_trait::async_trait]
impl ProjectorTrait for ImportRequestProjector {
    /// Projector name.
    fn projector_name() -> &'static str {
        "ImportRequestProjector"
    }
    /// Database connection
    fn database_connection(&self) -> &DatabaseConnection {
        &self.db
    }
    /// User settings
    fn user_settings(&self) -> &[UserSettingsResult] {
        &self.user_settings
    }
    /// Last seen event numbers.
    fn last_seen_event_number(&self) -> i64 {
        self.last_seen_event_number
    }
    /// Last seen event numbers mutable reference.
    fn last_seen_event_number_mut(&mut self) -> &mut i64 {
        &mut self.last_seen_event_number
    }

    /// Init a new [`ImportRequestProjector`].
    fn init(
        db: DatabaseConnection,
        last_seen_event_number: i64,
        user_settings: Vec<UserSettingsResult>,
    ) -> Self {
        Self {
            db,
            last_seen_event_number,
            user_settings,
        }
    }

    /// Project records based on a single event.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the insertion into the projection fails.
    #[instrument(skip(txn))]
    async fn project(
        txn: &DatabaseTransaction,
        event: &Event,
        user_settings: &[UserSettingsResult],
    ) -> Result<(), DbErr> {
        todo!()
    }
}
