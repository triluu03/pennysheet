//! Budget projector.

use domain::events::{
    Event,
    budgets::BudgetType,
};
use sea_orm::{
    ActiveModelTrait,
    DatabaseConnection,
    DatabaseTransaction,
    DbErr,
    prelude::async_trait,
};
use tracing::instrument;

use crate::{
    UserSettingsResult,
    projections::{
        BudgetProjectionTrait,
        monthly_budgets,
        weekly_budgets,
    },
    projectors::{
        ProjectorState,
        ProjectorTrait,
    },
};

#[derive(Debug, Clone)]
pub struct BudgetProjector {
    state: ProjectorState,
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
    /// Projector state mutable reference.
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
            | Event::TransactionCategorized(_)
            | Event::TransactionClassified(_)
            | Event::TransactionNoteUpdated(_)
            | Event::ImportTransactionsContinued(_) => {
                // Skip these transaction events.
                Ok(())
            },
            Event::TransactionRecorded(data) => {
                // Check against the active weekly budget threshold.
                if let Some(budget) = weekly_budgets::Entity::get_active_budget(txn).await?
                    && data.amount <= budget.threshold
                    && let Some(row) =
                        weekly_budgets::ActiveModel::from_recorded_transaction(data.clone())
                {
                    row.apply_user_settings(user_settings).insert(txn).await?;
                }
                // Check against the active monthly budget threshold.
                if let Some(budget) = monthly_budgets::Entity::get_active_budget(txn).await?
                    && data.amount <= budget.threshold
                    && let Some(row) =
                        monthly_budgets::ActiveModel::from_recorded_transaction(data.clone())
                {
                    row.apply_user_settings(user_settings).insert(txn).await?;
                }
                Ok(())
            },
            Event::BudgetCreated(data) | Event::BudgetUpdated(data) => match data.budget_type {
                BudgetType::Weekly => {
                    weekly_budgets::Entity::start_tracking_new_budget(txn, data).await?;
                    Ok(())
                },
                BudgetType::Monthly => {
                    monthly_budgets::Entity::start_tracking_new_budget(txn, data).await?;
                    Ok(())
                },
            },
            Event::BudgetDeleted(budget_type) => match budget_type {
                BudgetType::Weekly => {
                    weekly_budgets::Entity::delete_budget_tracking(txn).await?;
                    Ok(())
                },
                BudgetType::Monthly => {
                    monthly_budgets::Entity::delete_budget_tracking(txn).await?;
                    Ok(())
                },
            },
            Event::BudgetExceeded(_) => {
                // No projection change needed.
                Ok(())
            },
            Event::BudgetReset(budget_type) => match budget_type {
                BudgetType::Weekly => {
                    weekly_budgets::Entity::reset_budget(txn).await?;
                    Ok(())
                },
                BudgetType::Monthly => {
                    monthly_budgets::Entity::reset_budget(txn).await?;
                    Ok(())
                },
            },
        }
    }
}
