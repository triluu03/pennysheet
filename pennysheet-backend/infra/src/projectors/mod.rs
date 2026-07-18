//! Projectors

use domain::events::Event;
use sea_orm::{
    DatabaseConnection,
    DatabaseTransaction,
    DbErr,
    TransactionTrait,
    prelude::async_trait,
};
use sqlx::postgres::PgListener;
use tracing::{
    debug,
    info,
    instrument,
    warn,
};

use crate::{
    get_database_url,
    get_events_with_offset,
    get_user_settings,
    projections::projector_states::{
        get_projector_state,
        update_projector_state,
    },
    user_settings::UserSettingsResult,
};

mod core_projector;
mod import_request_projector;

pub use core_projector::CoreProjector;
pub use import_request_projector::ImportRequestProjector;

#[derive(Debug, Clone)]
pub struct ProjectorState {
    db: DatabaseConnection,
    last_seen_event_number: i64,
    user_settings: Vec<UserSettingsResult>,
}

/// Projector trait that defines the interface for all projectors.
#[async_trait::async_trait]
pub trait ProjectorTrait {
    /// Projector name
    fn projector_name() -> &'static str;
    /// Projector state reference.
    fn state(&self) -> &ProjectorState;
    /// Projector state mutatble reference.
    fn state_mut(&mut self) -> &mut ProjectorState;

    /// Database connection
    fn database_connection(&self) -> &DatabaseConnection {
        &self.state().db
    }

    /// User settings
    fn user_settings(&self) -> &[UserSettingsResult] {
        &self.state().user_settings
    }

    /// Last seen event numbers.
    fn last_seen_event_number(&self) -> i64 {
        self.state().last_seen_event_number
    }

    /// Last seen event numbers mutable reference.
    fn last_seen_event_number_mut(&mut self) -> &mut i64 {
        &mut self.state_mut().last_seen_event_number
    }

    /// Initialize a projector from its expected fields.
    fn init(
        db: DatabaseConnection,
        last_seen_event_number: i64,
        user_settings: Vec<UserSettingsResult>,
    ) -> Self
    where
        Self: Sized;

    /// Construct a new projector from an owned database connection.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the initialization fails.
    #[instrument(skip(db), fields(projector = Self::projector_name()))]
    async fn new(db: DatabaseConnection) -> Result<Self, DbErr>
    where
        Self: Sized,
    {
        let last_seen_event_number = get_projector_state(&db, Self::projector_name())
            .await?
            .unwrap_or(0);
        let user_settings = get_user_settings(&db).await?;

        info!(last_seen_event_number, "projector initialized");
        Ok(Self::init(db, last_seen_event_number, user_settings))
    }

    /// Listen to new events appended and run the projections.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the listener crashes or the projection fails.
    #[instrument(skip(self), fields(projector = Self::projector_name()))]
    async fn listen_to_new_events(&mut self) -> Result<(), DbErr> {
        let (database_url, db_name) = get_database_url()?;

        let mut listener = PgListener::connect(&format!("{database_url}/{db_name}"))
            .await
            .map_err(|err| DbErr::Custom(format!("Failed to connect PgListener: {}", err)))?;

        listener.listen("EventStore").await.map_err(|err| {
            DbErr::Custom(format!("Failed to listen to the event table: {}", err))
        })?;

        // Refresh any unseen events appended while the project was not online.
        info!("clearing projection backlog before listening");
        self.run_projections().await?;

        // Subscribe to notifications from the event table.
        loop {
            match listener.recv().await {
                Ok(notification) => {
                    if notification.payload() == "new-events-appended" {
                        self.run_projections().await?;
                    }
                },
                Err(e) => {
                    warn!(
                        error = %e,
                        "event listener crashed"
                    );
                    return Err(DbErr::Custom(format!("Listener crashed: {}", e)));
                },
            }
        }
    }

    /// Run projections.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the projection fails.
    #[instrument(skip(self), fields(projector = Self::projector_name()))]
    async fn run_projections(&mut self) -> Result<(), DbErr> {
        let unseen_events =
            get_events_with_offset(self.database_connection(), self.last_seen_event_number())
                .await?;
        let n_unseen_events: i64 = unseen_events
            .len()
            .try_into()
            .map_err(|err| DbErr::Custom(format!("Failed to parse usize into i64: {}", err)))?;

        if n_unseen_events == 0 {
            debug!("no unseen events to project");
            return Ok(());
        }

        info!(
            n_unseen_events,
            from_event = self.last_seen_event_number() + 1,
            "projecting unseen events"
        );
        let txn = self.database_connection().begin().await?;
        Self::multi_project(&txn, &unseen_events, self.user_settings()).await?;
        update_projector_state(
            &txn,
            Self::projector_name(),
            self.last_seen_event_number() + n_unseen_events,
        )
        .await?;
        txn.commit().await?;

        // Update the state of the current spawned projector.
        *self.last_seen_event_number_mut() += n_unseen_events;
        info!(
            last_seen_event_number = self.last_seen_event_number(),
            "projection committed"
        );
        Ok(())
    }

    /// Project records based on a single event.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the insertion into the projection fails.
    async fn project(
        txn: &DatabaseTransaction,
        event: &Event,
        user_settings: &[UserSettingsResult],
    ) -> Result<(), DbErr>;

    /// Project records based on multiple events.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if any insertion into the projection fails.
    async fn multi_project(
        txn: &DatabaseTransaction,
        events: &[Event],
        user_settings: &[UserSettingsResult],
    ) -> Result<(), DbErr> {
        for event in events.iter() {
            Self::project(txn, event, user_settings).await?
        }
        Ok(())
    }
}
