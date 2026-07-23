//! Budget Process Manager

use chrono::NaiveDate;

use crate::{
    commands::GatewayCommand,
    errors::DomainError,
    events::{
        Event,
        budgets::BudgetType,
    },
};

#[derive(Default, Debug)]
struct Budget {
    start_date: NaiveDate,
    amount: f64,
    threshold: f64,
}

#[derive(Default, Debug)]
pub struct BudgetProcessManager {
    /// Weekly budget. [`None`] means no active weekly budgets.
    weekly_budget: Option<Budget>,
    /// Weekly remaining amount.
    weekly_remaining_amount: f64,
    /// Monthly budget. [`None`] means no active monthly budgets.
    monthly_budget: Option<Budget>,
    /// Monthly remaining amount.
    monthly_remaining_amount: f64,
}

impl BudgetProcessManager {
    /// Construct a [`BudgetProcessManager`] from the current event table.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] if there's no pending transaction import request.
    pub fn new(all_events: &[Event]) -> Result<Self, DomainError> {
        let new_self = Self {
            ..Default::default()
        }
        .multi_apply(all_events);

        match (&new_self.weekly_budget, &new_self.monthly_budget) {
            (None, None) => Err(DomainError::ComponentInit(
                "Neither weekly or monthly budgets are active!".to_string(),
            )),
            _ => Ok(new_self),
        }
    }

    /// Create a [`GatewayCommand`] command.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::CommandCreation`] if neither weekly or monthly budgets are exceeded.
    pub fn create_gateway_command(&self) -> Result<GatewayCommand, DomainError> {
        // TODO: issue a gateway command to the notifier to tell the user (via Telegram bot) that
        // budgets have been exceeded!
        todo!()
    }

    /// Construct the state from one event.
    pub fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::TransactionRecorded(data) => {
                if let Some(budget) = &self.weekly_budget
                    && data.amount <= budget.threshold
                    && data
                        .booking_date
                        .is_some_and(|booking_date| booking_date >= budget.start_date)
                {
                    self.weekly_remaining_amount -= data.amount
                }

                if let Some(budget) = &self.monthly_budget
                    && data.amount <= budget.threshold
                    && data
                        .booking_date
                        .is_some_and(|booking_date| booking_date >= budget.start_date)
                {
                    self.monthly_remaining_amount -= data.amount
                }
            },
            Event::ImportTransactionsRequested(_)
            | Event::ImportTransactionsContinued(_)
            | Event::ImportTransactionsCompleted(_)
            | Event::ImportTransactionsFailed(_)
            | Event::TransactionImportRetryRequested(_)
            | Event::TransactionCategorized(_)
            | Event::TransactionClassified(_)
            | Event::TransactionNoteUpdated(_) => {
                // Ignore these transaction events
            },
            // NOTE: probably it doesn't make sense to reset the remaining amount
            // when a budget is updated.
            // TODO: address this behavior!
            Event::BudgetCreated(data) | Event::BudgetUpdated(data) => match data.budget_type {
                BudgetType::Weekly => {
                    self.weekly_budget = Some(Budget {
                        start_date: data.start_date,
                        amount: data.amount,
                        threshold: data.threshold,
                    });
                    self.weekly_remaining_amount = data.amount
                },
                BudgetType::Monthly => {
                    self.monthly_budget = Some(Budget {
                        start_date: data.start_date,
                        amount: data.amount,
                        threshold: data.threshold,
                    });
                    self.monthly_remaining_amount = data.amount
                },
            },
            Event::BudgetDeleted(budget_type) => match budget_type {
                BudgetType::Weekly => self.weekly_budget = None,
                BudgetType::Monthly => self.monthly_budget = None,
            },
            Event::BudgetReset(data) => match data.budget_type {
                BudgetType::Weekly => {
                    if let Some(budget) = &mut self.weekly_budget {
                        budget.start_date = data.start_date;
                        self.weekly_remaining_amount = budget.amount
                    }
                },
                BudgetType::Monthly => {
                    if let Some(budget) = &mut self.monthly_budget {
                        budget.start_date = data.start_date;
                        self.monthly_remaining_amount = budget.amount
                    }
                },
            },
            Event::BudgetExceeded(_) => {
                // Ignore this budget event
            },
        }

        self
    }

    /// Construct the state from multiple events (in order).
    pub fn multi_apply(self, events: &[Event]) -> Self {
        events
            .iter()
            .fold(self, |manager, event| manager.apply(event))
    }
}
