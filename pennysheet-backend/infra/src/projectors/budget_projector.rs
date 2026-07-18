//! Budget projector.

use domain::events::{
    Event,
    budgets::{
        BudgetData,
        BudgetType,
    },
};
use sea_orm::{
    DatabaseConnection,
    DatabaseTransaction,
    DbErr,
    prelude::async_trait,
};
use tracing::instrument;

use crate::{
    UserSettingsResult,
    projections::weekly_budgets,
    projectors::{
        ProjectorState,
        ProjectorTrait,
    },
};

#[derive(Debug, Clone)]
pub struct BudgetProjector {
    state: ProjectorState,
    weekly_budget: Option<BudgetData>,
    monthly_budget: Option<BudgetData>,
}

#[async_trait::async_trait]
impl ProjectorTrait for BudgetProjector {
    /// Projector name.
    fn projector_name() -> &'static str {
        "BudgetProjector"
    }
    /// Projector state reference.
    fn state(&self) -> &ProjectorState {
        &self.state
    }
    /// Projector state mutatble reference.
    fn state_mut(&mut self) -> &mut ProjectorState {
        &mut self.state
    }

    /// Init a new [`BudgetProjector`].
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
            weekly_budget: None,
            monthly_budget: None,
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
            Event::ImportTransactionsRequested(_)
            | Event::ImportTransactionsCompleted(_)
            | Event::ImportTransactionsFailed(_)
            | Event::TransactionImportRetryRequested(_)
            | Event::TransactionRecorded(_)
            | Event::TransactionCategorized(_)
            | Event::TransactionClassified(_)
            | Event::TransactionNoteUpdated(_)
            | Event::ImportTransactionsContinued(_) => {
                // Skip these transaction events.
                Ok(())
            },
            Event::BudgetCreated(data) => match data.budget_type {
                BudgetType::Weekly => {
                    weekly_budgets::start_tracking_new_budget(txn).await?;
                    Ok(())
                },
                BudgetType::Monthly => {
                    todo!()
                },
            },
            Event::BudgetUpdated(_)
            | Event::BudgetDeleted(_)
            | Event::BudgetExceeded(_)
            | Event::BudgetReset(_) => {
                // Skip these budget events
                Ok(())
            },
        }
    }

    /// Construct projector's state based on a single event.
    #[instrument(skip(self))]
    fn apply(&mut self, event: &Event) {
        match event {
            Event::ImportTransactionsRequested(_)
            | Event::ImportTransactionsCompleted(_)
            | Event::ImportTransactionsFailed(_)
            | Event::TransactionImportRetryRequested(_)
            | Event::TransactionRecorded(_)
            | Event::TransactionCategorized(_)
            | Event::TransactionClassified(_)
            | Event::TransactionNoteUpdated(_)
            | Event::ImportTransactionsContinued(_) => {
                // Skip these transaction events.
            },
            Event::BudgetCreated(_)
            | Event::BudgetUpdated(_)
            | Event::BudgetDeleted(_)
            | Event::BudgetExceeded(_)
            | Event::BudgetReset(_) => {
                // Skip these budget events
            },
        }
    }
}
