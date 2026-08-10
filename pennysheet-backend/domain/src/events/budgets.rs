//! Budgets-related event data.

use chrono::NaiveDate;
use core::fmt;
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

use super::transactions::TransactionData;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum BudgetType {
    Weekly,
    Monthly,
}

impl fmt::Display for BudgetType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Weekly => write!(f, "weekly"),
            Self::Monthly => write!(f, "monthly"),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct BudgetData {
    pub start_date: NaiveDate,
    pub budget_type: BudgetType,
    pub amount: f64,
    /// The threshold below which transactions are counted towards the budget.
    pub threshold: f64,
}

/// Data carried by a [`BudgetReset`](super::Event::BudgetReset) event.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct BudgetResetData {
    pub start_date: NaiveDate,
    pub budget_type: BudgetType,
    #[serde(default)]
    pub previous_remaining: f64,
}

/// Data carried by [`super::Event::BudgetExpenseTracked`].
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct TrackedExpenseData {
    pub transaction_id: Uuid,
    pub booking_date: Option<NaiveDate>,
    pub transaction_date: Option<NaiveDate>,
    pub amount: f64,
    pub currency: String,
    pub creditor_name: String,
    pub budget_type: BudgetType,
}

impl TrackedExpenseData {
    /// Build tracked-expense data from a transaction for a budget type.
    ///
    /// Returns [`None`] when the transaction does not have a creditor name.
    ///
    /// # Parameters
    ///
    /// * `data` - Recorded transaction data to copy.
    /// * `budget_type` - Budget period that accepted the transaction.
    ///
    /// # Returns
    ///
    /// Tracked expense data when the transaction has a creditor name.
    pub fn from_transaction(data: &TransactionData, budget_type: BudgetType) -> Option<Self> {
        let creditor_name = data.creditor_name.clone()?;
        Some(Self {
            transaction_id: data.transaction_id,
            booking_date: data.booking_date,
            transaction_date: data.transaction_date,
            amount: data.amount,
            currency: data.currency.clone(),
            creditor_name,
            budget_type,
        })
    }
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;
    use uuid::Uuid;

    use super::{
        BudgetType,
        TrackedExpenseData,
    };
    use crate::events::transactions::TransactionData;

    /// A transaction with a creditor can be converted into tracked-expense data.
    #[test]
    fn from_transaction_accepts_transactions_with_creditors() {
        let transaction_id = Uuid::new_v4();
        let data = TransactionData {
            transaction_id,
            booking_date: NaiveDate::from_ymd_opt(2026, 6, 15),
            transaction_date: NaiveDate::from_ymd_opt(2026, 6, 14),
            amount: 42.5,
            currency: "EUR".to_string(),
            creditor_name: Some("Acme Corp".to_string()),
            debtor_name: None,
            entry_reference: None,
            account_uid: "test-account-uid".to_string(),
        };

        let tracked = TrackedExpenseData::from_transaction(&data, BudgetType::Weekly)
            .expect("a creditor should produce tracked expense data");

        assert_eq!(tracked.transaction_id, transaction_id);
        assert_eq!(tracked.booking_date, data.booking_date);
        assert_eq!(tracked.transaction_date, data.transaction_date);
        assert_eq!(tracked.amount, data.amount);
        assert_eq!(tracked.currency, data.currency);
        assert_eq!(tracked.creditor_name, "Acme Corp");
        assert_eq!(tracked.budget_type, BudgetType::Weekly);
    }

    /// A transaction without a creditor cannot become a tracked expense.
    #[test]
    fn from_transaction_rejects_transactions_without_creditors() {
        let data = TransactionData {
            transaction_id: Uuid::new_v4(),
            booking_date: None,
            transaction_date: None,
            amount: 42.5,
            currency: "EUR".to_string(),
            creditor_name: None,
            debtor_name: None,
            entry_reference: None,
            account_uid: "test-account-uid".to_string(),
        };

        assert!(TrackedExpenseData::from_transaction(&data, BudgetType::Monthly).is_none());
    }
}
