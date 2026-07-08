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
    projections::{
        self,
        import_requests::ImportRequestStatus,
    },
    projectors::{
        ProjectorState,
        ProjectorTrait,
    },
};

#[derive(Debug, Clone)]
pub struct ImportRequestProjector {
    state: ProjectorState,
}

#[async_trait::async_trait]
impl ProjectorTrait for ImportRequestProjector {
    /// Projector name.
    fn projector_name() -> &'static str {
        "ImportRequestProjector"
    }
    /// Projector state reference.
    fn state(&self) -> &ProjectorState {
        &self.state
    }
    /// Projector state mutatble reference.
    fn state_mut(&mut self) -> &mut ProjectorState {
        &mut self.state
    }

    /// Init a new [`ImportRequestProjector`].
    fn init(
        db: DatabaseConnection,
        last_seen_event_number: i64,
        user_settings: Vec<UserSettingsResult>,
    ) -> Self {
        Self {
            state: ProjectorState {
                db,
                last_seen_event_number,
                user_settings,
            },
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
        match event {
            Event::ImportTransactionsRequested(data) => {
                projections::import_requests::create_new_import_request(
                    txn,
                    data.request_id,
                    data.session_id,
                )
                .await
            },
            Event::ImportTransactionsCompleted(data) => {
                projections::import_requests::update_import_request_status(
                    txn,
                    data.request_id,
                    ImportRequestStatus::Succeeded,
                )
                .await
            },
            Event::ImportTransactionsFailed(data) => {
                projections::import_requests::update_import_request_status(
                    txn,
                    data.request_id,
                    ImportRequestStatus::Failed,
                )
                .await
            },
            Event::TransactionImportRetryRequested(data) => {
                projections::import_requests::update_import_request_status(
                    txn,
                    data.request_id,
                    ImportRequestStatus::Pending,
                )
                .await
            },
            Event::TransactionRecorded(_)
            | Event::TransactionCategorized(_)
            | Event::TransactionClassified(_)
            | Event::TransactionNoteUpdated(_)
            | Event::ImportTransactionsContinued(_) => {
                // Skip these events.
                Ok(())
            },
        }
    }
}
