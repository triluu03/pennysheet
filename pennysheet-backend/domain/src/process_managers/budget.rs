//! Budget Process Manager

use chrono::NaiveDate;

use crate::{
    commands::GatewayCommand,
    errors::DomainError,
    events::{
        Event,
        budgets::{
            BudgetData,
            BudgetType,
        },
    },
};

#[derive(Default, Debug)]
pub struct BudgetProcessManager {
    /// Weekly budget. [`None`] means no active weekly budgets.
    weekly_budget: Option<BudgetData>,
    /// Weekly remaining amount.
    weekly_remaining_amount: f64,
    /// Monthly budget. [`None`] means no active monthly budgets.
    monthly_budget: Option<BudgetData>,
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

    /// Build an HTML-formatted daily budget-status message and wrap it in a
    /// [`GatewayCommand::SendTelegramMessage`].
    ///
    /// The message includes a date header, a progress bar with a color-coded
    /// status emoji, and the remaining vs total amount for each active budget.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::CommandCreation`] if the formatted message body
    /// is empty (which should never happen when at least one budget is active).
    pub fn create_gateway_command(&self, today: NaiveDate) -> Result<GatewayCommand, DomainError> {
        let date_str = today.format("%b %d").to_string();
        let mut lines = vec![format!("📊 <b>Budget Status — {date_str}</b>\n")];

        lines.push(format_budget_line(
            "Weekly",
            self.weekly_remaining_amount,
            self.weekly_budget.as_ref(),
        ));
        lines.push(format_budget_line(
            "Monthly",
            self.monthly_remaining_amount,
            self.monthly_budget.as_ref(),
        ));

        Ok(GatewayCommand::SendTelegramMessage(lines.join("\n")))
    }

    /// Return the start date for the active budget of the given type, if any.
    ///
    /// Returns [`None`] when the requested budget type is not active.
    pub fn start_date(&self, budget_type: BudgetType) -> Option<NaiveDate> {
        match budget_type {
            BudgetType::Weekly => self.weekly_budget.as_ref().map(|b| b.start_date),
            BudgetType::Monthly => self.monthly_budget.as_ref().map(|b| b.start_date),
        }
    }

    /// Return the remaining amount for the active budget of the given type.
    ///
    /// Returns the current `weekly_remaining_amount` or `monthly_remaining_amount`
    /// depending on `budget_type`.
    pub fn remaining_amount(&self, budget_type: BudgetType) -> f64 {
        match budget_type {
            BudgetType::Weekly => self.weekly_remaining_amount,
            BudgetType::Monthly => self.monthly_remaining_amount,
        }
    }

    /// Construct the state from one event.
    ///
    /// Budget remaining amounts are changed by `BudgetExpenseTracked` events; recorded
    /// transactions are not evaluated for budget eligibility here.
    pub fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::BudgetExpenseTracked(data) => match data.budget_type {
                BudgetType::Weekly => {
                    if self.weekly_budget.is_some() {
                        self.weekly_remaining_amount -= data.amount;
                    }
                },
                BudgetType::Monthly => {
                    if self.monthly_budget.is_some() {
                        self.monthly_remaining_amount -= data.amount;
                    }
                },
            },
            Event::TransactionRecorded(_)
            | Event::ImportTransactionsRequested(_)
            | Event::ImportTransactionsContinued(_)
            | Event::ImportTransactionsCompleted(_)
            | Event::ImportTransactionsFailed(_)
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
                    self.weekly_budget = Some(*data);
                    self.weekly_remaining_amount = data.amount
                },
                BudgetType::Monthly => {
                    self.monthly_budget = Some(*data);
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
                        self.weekly_remaining_amount = budget.amount + data.previous_remaining;
                    }
                },
                BudgetType::Monthly => {
                    if let Some(budget) = &mut self.monthly_budget {
                        budget.start_date = data.start_date;
                        self.monthly_remaining_amount = budget.amount + data.previous_remaining;
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

/// Format a single budget line for the daily status message using Telegram
/// HTML markup.
///
/// When a budget is active the line includes a color-coded emoji (🟢 ≥50%,
/// 🟡 ≥25%, 🔴 otherwise), a 10-block progress bar, the remaining percentage,
/// and the dollar amounts. When a budget is [`None`] the line shows `⚪ Not
/// set`.
fn format_budget_line(label: &str, remaining: f64, budget: Option<&BudgetData>) -> String {
    match budget {
        Some(b) => {
            let emoji = status_emoji(remaining, b.amount);
            let sign = if remaining < 0.0 { "−" } else { "" };
            format!(
                "{emoji} <b>{label}</b>  {sign}${abs:.2} left of ${total:.2}",
                abs = remaining.abs(),
                total = b.amount
            )
        },
        None => {
            format!("⚪ <b>{label}</b>  Not set")
        },
    }
}

/// Return a color-coded emoji based on the proportion of budget remaining.
///
/// 🟢 when ≥50% remains, 🟡 when ≥25%, 🔴 otherwise (including when
/// overspent).
fn status_emoji(remaining: f64, total: f64) -> &'static str {
    let ratio = remaining / total;
    if ratio >= 0.5 {
        "🟢"
    } else if ratio >= 0.25 {
        "🟡"
    } else {
        "🔴"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::events::budgets::{
        BudgetData,
        BudgetResetData,
        BudgetType,
        TrackedExpenseData,
    };
    use chrono::NaiveDate;

    /// Fixture start date for budget events.
    fn start_date() -> NaiveDate {
        NaiveDate::from_ymd_opt(2026, 1, 1).expect("hard-coded test date is valid")
    }

    /// Fixture "today" date used when building messages.
    fn today() -> NaiveDate {
        NaiveDate::from_ymd_opt(2026, 1, 19).expect("hard-coded test date is valid")
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
    /// with progress bars, emoji, and HTML markup.
    #[test]
    fn create_gateway_command_with_both_budgets_active() {
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 50.0),
            budget_created_event(BudgetType::Monthly, 2000.0, 100.0),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();

        let command = manager.create_gateway_command(today()).unwrap();
        let GatewayCommand::SendTelegramMessage(body) = command else {
            panic!("expected SendTelegramMessage");
        };

        assert!(
            body.starts_with("📊 <b>Budget Status — Jan 19</b>"),
            "body: {body}"
        );
        assert!(
            body.contains("🟢 <b>Weekly</b>  $500.00 left of $500.00"),
            "body: {body}"
        );
        assert!(
            body.contains("🟢 <b>Monthly</b>  $2000.00 left of $2000.00"),
            "body: {body}"
        );
    }

    /// When only a weekly budget is active the message includes the weekly
    /// line and a "Not set" line for monthly.
    #[test]
    fn create_gateway_command_with_only_weekly_active() {
        let events = [budget_created_event(BudgetType::Weekly, 300.0, 25.0)];
        let manager = BudgetProcessManager::new(&events).unwrap();

        let command = manager.create_gateway_command(today()).unwrap();
        let GatewayCommand::SendTelegramMessage(body) = command else {
            panic!("expected SendTelegramMessage");
        };

        assert!(
            body.contains("🟢 <b>Weekly</b>  $300.00 left of $300.00"),
            "body: {body}"
        );
        assert!(body.contains("⚪ <b>Monthly</b>  Not set"), "body: {body}");
    }

    /// When only a monthly budget is active the message includes the monthly
    /// line and a "Not set" line for weekly.
    #[test]
    fn create_gateway_command_with_only_monthly_active() {
        let events = [budget_created_event(BudgetType::Monthly, 1500.0, 50.0)];
        let manager = BudgetProcessManager::new(&events).unwrap();

        let command = manager.create_gateway_command(today()).unwrap();
        let GatewayCommand::SendTelegramMessage(body) = command else {
            panic!("expected SendTelegramMessage");
        };

        assert!(body.contains("⚪ <b>Weekly</b>  Not set"), "body: {body}");
        assert!(
            body.contains("🟢 <b>Monthly</b>  $1500.00 left of $1500.00"),
            "body: {body}"
        );
    }

    /// When the remaining amount goes negative (budget exceeded) the progress
    /// bar is empty, the emoji is red, and a minus sign is used.
    #[test]
    fn create_gateway_command_shows_negative_remaining() {
        use crate::events::{
            budgets::TrackedExpenseData,
            transactions::TransactionData,
        };
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
            entry_reference: None,
        };
        let recorded =
            TransactionData::new(transaction, "test-account-uid").expect("valid transaction");

        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 600.0),
            Event::BudgetExpenseTracked(
                TrackedExpenseData::from_transaction(&recorded, BudgetType::Weekly)
                    .expect("fixture transaction has a creditor"),
            ),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();

        let command = manager.create_gateway_command(today()).unwrap();
        let GatewayCommand::SendTelegramMessage(body) = command else {
            panic!("expected SendTelegramMessage");
        };

        assert!(
            body.contains("🔴 <b>Weekly</b>  −$100.00 left of $500.00"),
            "body: {body}"
        );
    }

    /// Constructing with no active budgets returns an error from `new`.
    #[test]
    fn new_fails_without_any_active_budget() {
        let result = BudgetProcessManager::new(&[]);
        assert!(matches!(result, Err(DomainError::ComponentInit(_))));
    }

    /// When resetting with a positive previous_remaining (leftover), the new
    /// remaining amount equals the configured budget amount plus the rolled-over
    /// leftover.
    #[test]
    fn reset_with_positive_remaining_rolls_over_leftover() {
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 50.0),
            Event::BudgetReset(BudgetResetData {
                start_date: NaiveDate::from_ymd_opt(2026, 2, 1).unwrap(),
                budget_type: BudgetType::Weekly,
                previous_remaining: 200.0,
            }),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();
        assert!((manager.remaining_amount(BudgetType::Weekly) - 700.0).abs() < f64::EPSILON);
    }

    /// When resetting with a negative previous_remaining (overspend), the new
    /// remaining amount is reduced below the configured amount.
    #[test]
    fn reset_with_negative_remaining_reduces_new_total() {
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 50.0),
            Event::BudgetReset(BudgetResetData {
                start_date: NaiveDate::from_ymd_opt(2026, 2, 1).unwrap(),
                budget_type: BudgetType::Weekly,
                previous_remaining: -100.0,
            }),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();
        assert!((manager.remaining_amount(BudgetType::Weekly) - 400.0).abs() < f64::EPSILON);
    }

    /// Consecutive resets recompute the configured budget plus each reset's rollover.
    #[test]
    fn consecutive_resets_recompute_configured_budget_with_rollover() {
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 50.0),
            // First reset: 200 leftover → new total 700
            Event::BudgetReset(BudgetResetData {
                start_date: NaiveDate::from_ymd_opt(2026, 2, 1).unwrap(),
                budget_type: BudgetType::Weekly,
                previous_remaining: 200.0,
            }),
            // Second reset: another 100 leftover → configured budget plus rollover is 600.
            Event::BudgetReset(BudgetResetData {
                start_date: NaiveDate::from_ymd_opt(2026, 3, 1).unwrap(),
                budget_type: BudgetType::Weekly,
                previous_remaining: 100.0,
            }),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();
        assert!((manager.remaining_amount(BudgetType::Weekly) - 600.0).abs() < f64::EPSILON);
    }

    /// `remaining_amount()` returns the per-type remaining after applying
    /// transaction events.
    #[test]
    fn remaining_amount_returns_current_remaining_per_type() {
        use crate::events::{
            budgets::TrackedExpenseData,
            transactions::TransactionData,
        };
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
                amount: "100.00".to_string(),
            },
            creditor: Some(PartyIdentification {
                name: Some("Test Store".to_string()),
            }),
            debtor: None,
            booking_date: Some("2026-01-02".to_string()),
            transaction_date: Some("2026-01-02".to_string()),
            entry_reference: None,
        };
        let recorded =
            TransactionData::new(transaction, "test-account-uid").expect("valid transaction");

        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 200.0),
            budget_created_event(BudgetType::Monthly, 1000.0, 200.0),
            Event::BudgetExpenseTracked(
                TrackedExpenseData::from_transaction(&recorded, BudgetType::Weekly)
                    .expect("fixture transaction has a creditor"),
            ),
            Event::BudgetExpenseTracked(
                TrackedExpenseData::from_transaction(&recorded, BudgetType::Monthly)
                    .expect("fixture transaction has a creditor"),
            ),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();

        assert!((manager.remaining_amount(BudgetType::Weekly) - 400.0).abs() < f64::EPSILON);
        assert!((manager.remaining_amount(BudgetType::Monthly) - 900.0).abs() < f64::EPSILON);
    }

    /// Tracked weekly expenses reduce only the weekly remaining amount.
    #[test]
    fn tracked_weekly_expense_reduces_weekly_budget() {
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 50.0),
            budget_created_event(BudgetType::Monthly, 1000.0, 50.0),
            Event::BudgetExpenseTracked(TrackedExpenseData {
                transaction_id: uuid::Uuid::new_v4(),
                booking_date: Some(start_date()),
                transaction_date: Some(start_date()),
                amount: 100.0,
                currency: "EUR".to_string(),
                creditor_name: "Test Store".to_string(),
                budget_type: BudgetType::Weekly,
            }),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();

        assert_eq!(manager.remaining_amount(BudgetType::Weekly), 400.0);
        assert_eq!(manager.remaining_amount(BudgetType::Monthly), 1000.0);
    }

    /// Tracked monthly expenses reduce only the monthly remaining amount.
    #[test]
    fn tracked_monthly_expense_reduces_monthly_budget() {
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 50.0),
            budget_created_event(BudgetType::Monthly, 1000.0, 50.0),
            Event::BudgetExpenseTracked(TrackedExpenseData {
                transaction_id: uuid::Uuid::new_v4(),
                booking_date: Some(start_date()),
                transaction_date: Some(start_date()),
                amount: 100.0,
                currency: "EUR".to_string(),
                creditor_name: "Test Store".to_string(),
                budget_type: BudgetType::Monthly,
            }),
        ];
        let manager = BudgetProcessManager::new(&events).unwrap();

        assert_eq!(manager.remaining_amount(BudgetType::Monthly), 900.0);
        assert_eq!(manager.remaining_amount(BudgetType::Weekly), 500.0);
    }

    /// Recorded transactions no longer change budget remaining amounts directly.
    #[test]
    fn recorded_transaction_does_not_directly_track_budget_expense() {
        use crate::events::transactions::TransactionData;

        let transaction = TransactionData {
            transaction_id: uuid::Uuid::new_v4(),
            booking_date: Some(start_date()),
            transaction_date: Some(start_date()),
            amount: 100.0,
            currency: "EUR".to_string(),
            creditor_name: Some("Test Store".to_string()),
            debtor_name: None,
            entry_reference: None,
            account_uid: "test-account-uid".to_string(),
        };
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 200.0),
            Event::TransactionRecorded(transaction),
        ];

        let manager = BudgetProcessManager::new(&events).unwrap();

        assert_eq!(manager.remaining_amount(BudgetType::Weekly), 500.0);
    }

    /// A tracked expense can be applied to both periods through two events.
    #[test]
    fn tracked_expense_supports_both_budget_periods() {
        let tracked = |budget_type| {
            Event::BudgetExpenseTracked(TrackedExpenseData {
                transaction_id: uuid::Uuid::new_v4(),
                booking_date: Some(start_date()),
                transaction_date: Some(start_date()),
                amount: 100.0,
                currency: "EUR".to_string(),
                creditor_name: "Test Store".to_string(),
                budget_type,
            })
        };
        let events = [
            budget_created_event(BudgetType::Weekly, 500.0, 50.0),
            budget_created_event(BudgetType::Monthly, 1000.0, 50.0),
            tracked(BudgetType::Weekly),
            tracked(BudgetType::Monthly),
        ];

        let manager = BudgetProcessManager::new(&events).unwrap();

        assert_eq!(manager.remaining_amount(BudgetType::Weekly), 400.0);
        assert_eq!(manager.remaining_amount(BudgetType::Monthly), 900.0);
    }
}
