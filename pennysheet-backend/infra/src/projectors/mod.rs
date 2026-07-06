//! Projectors

mod core_projector;
mod import_request_projector;

pub use core_projector::CoreProjector;

use sea_orm::{
    DatabaseConnection,
    DatabaseTransaction,
    DbErr,
    prelude::async_trait,
};

use crate::user_settings::UserSettingsResult;
use domain::events::Event;

/// Projector trait that defines the interface for all projectors.
#[async_trait::async_trait]
pub trait ProjectorTrait {
    /// Construct a new projector from a database connection reference.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the initialization fails.
    async fn new(db: DatabaseConnection) -> Result<Self, DbErr>
    where
        Self: Sized;

    /// Listen to new events appended and run the projections.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the listener crashes or the projection fails.
    async fn listen_to_new_events(&mut self) -> Result<(), DbErr>;

    /// Run projections.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the projection fails.
    async fn run_projections(&mut self) -> Result<(), DbErr>;

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
    ) -> Result<(), DbErr>;
}
