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

/// Project to all budget projections that implement [`BudgetProjectionTrait`].
macro_rules! project_to_all_budgets {
    ($method:ident, $txn:expr, $id:expr, $value:expr) => {{
        weekly_budgets::Entity::$method($txn, $id, $value).await?;
        monthly_budgets::Entity::$method($txn, $id, $value).await?;
    }};
}

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
    /// Budget tracking rows are created only from qualified `BudgetExpenseTracked` events;
    /// `TransactionRecorded` events are handled by the core projector instead.
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
            Event::BudgetExpenseTracked(data) => match data.budget_type {
                BudgetType::Weekly => {
                    weekly_budgets::ActiveModel::from_tracked_expense(data.clone())
                        .apply_user_settings(user_settings)
                        .insert(txn)
                        .await?;
                    Ok(())
                },
                BudgetType::Monthly => {
                    monthly_budgets::ActiveModel::from_tracked_expense(data.clone())
                        .apply_user_settings(user_settings)
                        .insert(txn)
                        .await?;
                    Ok(())
                },
            },
            Event::TransactionCategorized(data) => {
                project_to_all_budgets!(update_category, txn, data.transaction_id, data.category);
                Ok(())
            },
            Event::TransactionClassified(data) => {
                project_to_all_budgets!(
                    update_classification,
                    txn,
                    data.transaction_id,
                    data.classification
                );
                Ok(())
            },
            Event::TransactionRecorded(_)
            | Event::ImportTransactionsRequested(_)
            | Event::ImportTransactionsCompleted(_)
            | Event::ImportTransactionsFailed(_)
            | Event::TransactionNoteUpdated(_)
            | Event::ImportTransactionsContinued(_) => {
                // Skip these transaction events.
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
            Event::BudgetReset(data) => match data.budget_type {
                BudgetType::Weekly => {
                    weekly_budgets::Entity::reset_budget(
                        txn,
                        data.start_date,
                        data.previous_remaining,
                    )
                    .await?;
                    Ok(())
                },
                BudgetType::Monthly => {
                    monthly_budgets::Entity::reset_budget(
                        txn,
                        data.start_date,
                        data.previous_remaining,
                    )
                    .await?;
                    Ok(())
                },
            },
        }
    }
}
