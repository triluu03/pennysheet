//! Core Projector

use domain::events::Event;
use sea_orm::{
    ActiveModelTrait,
    DatabaseConnection,
    DatabaseTransaction,
    DbErr,
    prelude::async_trait,
};
use tracing::instrument;

use crate::{
    projections::{
        TransactionProjectionTrait,
        expenses,
        income,
        transactions,
    },
    projectors::{
        ProjectorState,
        ProjectorTrait,
    },
    user_settings::UserSettingsResult,
};

/// Project to all projections that implements [`TransactionProjectionTrait`].
macro_rules! project_to_all {
    ($method:ident, $txn:expr, $id:expr, $value:expr) => {{
        transactions::Entity::$method($txn, $id, $value).await?;
        expenses::Entity::$method($txn, $id, $value).await?;
        income::Entity::$method($txn, $id, $value).await?;
    }};
}

#[derive(Debug, Clone)]
pub struct CoreProjector {
    state: ProjectorState,
}

#[async_trait::async_trait]
impl ProjectorTrait for CoreProjector {
    /// Projector name.
    fn projector_name() -> &'static str {
        "CoreProjector"
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

    /// Project records based on one event.
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
            Event::TransactionRecorded(data) => {
                transactions::ActiveModel::from_recorded_transaction(data.clone())
                    .insert(txn)
                    .await?;

                if let Some(expense) =
                    expenses::ActiveModel::from_recorded_transaction(data.clone())
                {
                    expense
                        .apply_user_settings(user_settings)
                        .insert(txn)
                        .await?;
                };
                if let Some(income) = income::ActiveModel::from_recorded_transaction(data.clone()) {
                    income.insert(txn).await?;
                };

                Ok(())
            },
            Event::TransactionCategorized(data) => {
                project_to_all!(update_category, txn, data.transaction_id, data.category);
                Ok(())
            },
            Event::TransactionClassified(data) => {
                project_to_all!(
                    update_classification,
                    txn,
                    data.transaction_id,
                    data.classification
                );
                Ok(())
            },
            Event::TransactionNoteUpdated(data) => {
                project_to_all!(update_note, txn, data.transaction_id, data.note.clone());
                Ok(())
            },
            Event::ImportTransactionsContinued(_)
            | Event::ImportTransactionsRequested(_)
            | Event::ImportTransactionsCompleted(_)
            | Event::TransactionImportRetryRequested(_)
            | Event::ImportTransactionsFailed(_) => {
                // Skip these transaction events.
                Ok(())
            },
            Event::BudgetCreated(_)
            | Event::BudgetUpdated(_)
            | Event::BudgetDeleted(_)
            | Event::BudgetExceeded(_)
            | Event::BudgetReset(_) => {
                // Skip these budget events
                Ok(())
            },
        }
    }
}
