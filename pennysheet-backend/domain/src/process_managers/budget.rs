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
    /// Returns [`DomainError::ComponentInit`] if neither a weekly nor a monthly
    /// budget is active.
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

    /// Build a human-readable daily budget-status message and wrap it in a
    /// [`GatewayCommand::SendTelegramMessage`].
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::CommandCreation`] if the formatted message body
    /// is empty (which should never happen when at least one budget is active).
    pub fn create_gateway_command(&self) -> Result<GatewayCommand, DomainError> {
        let lines = [
            "📊 Daily Budget Status".to_string(),
            format_budget_line(
                "Weekly",
                self.weekly_remaining_amount,
                self.weekly_budget.as_ref(),
            ),
            format_budget_line(
                "Monthly",
                self.monthly_remaining_amount,
                self.monthly_budget.as_ref(),
            ),
        ];

        Ok(GatewayCommand::SendTelegramMessage(lines.join("\n")))
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

/// Format a single budget line for the daily status message.
///
/// Returns a formatted string like `"Weekly: $150.00 remaining of $500.00"`
/// when a budget is active, or `"Weekly: Not set"` when it is [`None`].
fn format_budget_line(label: &str, remaining: f64, budget: Option<&Budget>) -> String {
    match budget {
        Some(b) => {
            format!(
                "{label}: ${remaining:.2} remaining of ${amount:.2}",
                amount = b.amount
            )
        },
        None => {
            format!("{label}: Not set")
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::events::budgets::BudgetData;
    use chrono::NaiveDate;

    /// Fixture start date for budget events.
    fn start_date() -> NaiveDate {
        NaiveDate::from_ymd_opt(2026, 1, 1).expect("hard-coded test date is valid")
    }

    /// Create a `BudgetCreated` event for the given type, amount, and threshold.
    fn budget_created_event(budget_type: BudgetType, amount: f64, threshold: f64) -> Event {
        Event::BudgetCreated(BudgetData {
            start_date: start_date(),
            budget_type,
            amount,
            threshold,
        })
    }

    /// The message produced when both budgets are active includes both lines
    /// with dollar-formatted amounts.
    #[test]
    fn create_gateway_command_with_both_budgets_active() {
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 50.0),
            budget_created_event(BudgetType::Monthly, 2000.0, 100.0),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();

        let command = manager.create_gateway_command().unwrap();
        let GatewayCommand::SendTelegramMessage(body) = command else {
            panic!("expected SendTelegramMessage");
        };

        assert!(body.starts_with("📊 Daily Budget Status"), "body: {body}");
        assert!(
            body.contains("Weekly: $500.00 remaining of $500.00"),
            "body: {body}"
        );
        assert!(
            body.contains("Monthly: $2000.00 remaining of $2000.00"),
            "body: {body}"
        );
    }

    /// When only a weekly budget is active the message includes the weekly
    /// line and a "Not set" line for monthly.
    #[test]
    fn create_gateway_command_with_only_weekly_active() {
        let events = [budget_created_event(BudgetType::Weekly, 300.0, 25.0)];
        let manager = BudgetProcessManager::new(&events).unwrap();

        let command = manager.create_gateway_command().unwrap();
        let GatewayCommand::SendTelegramMessage(body) = command else {
            panic!("expected SendTelegramMessage");
        };

        assert!(
            body.contains("Weekly: $300.00 remaining of $300.00"),
            "body: {body}"
        );
        assert!(body.contains("Monthly: Not set"), "body: {body}");
    }

    /// When only a monthly budget is active the message includes the monthly
    /// line and a "Not set" line for weekly.
    #[test]
    fn create_gateway_command_with_only_monthly_active() {
        let events = [budget_created_event(BudgetType::Monthly, 1500.0, 50.0)];
        let manager = BudgetProcessManager::new(&events).unwrap();

        let command = manager.create_gateway_command().unwrap();
        let GatewayCommand::SendTelegramMessage(body) = command else {
            panic!("expected SendTelegramMessage");
        };

        assert!(body.contains("Weekly: Not set"), "body: {body}");
        assert!(
            body.contains("Monthly: $1500.00 remaining of $1500.00"),
            "body: {body}"
        );
    }

    /// When the remaining amount goes negative (budget exceeded) it is
    /// reflected in the message.
    #[test]
    fn create_gateway_command_shows_negative_remaining() {
        use crate::events::transactions::TransactionData;
        use gateway::schema::enable_banking_api::{
            AmountType,
            transaction::{
                PartyIdentification,
                Transaction,
            },
        };

        let transaction = Transaction {
            transaction_amount: AmountType {
                currency: "EUR".to_string(),
                amount: "600.00".to_string(),
            },
            creditor: Some(PartyIdentification {
                name: Some("Big Store".to_string()),
            }),
            debtor: None,
            booking_date: Some("2026-01-02".to_string()),
            transaction_date: Some("2026-01-02".to_string()),
        };
        let recorded = TransactionData::new(transaction).expect("valid transaction");

        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 600.0),
            Event::TransactionRecorded(recorded),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();

        let command = manager.create_gateway_command().unwrap();
        let GatewayCommand::SendTelegramMessage(body) = command else {
            panic!("expected SendTelegramMessage");
        };

        assert!(
            body.contains("Weekly: $-100.00 remaining of $500.00"),
            "body: {body}"
        );
    }

    /// Constructing with no active budgets returns an error from `new`.
    #[test]
    fn new_fails_without_any_active_budget() {
        let result = BudgetProcessManager::new(&[]);
        assert!(matches!(result, Err(DomainError::ComponentInit(_))));
    }
}
