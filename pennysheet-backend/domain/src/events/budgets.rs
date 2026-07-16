//! Budgets-related event data.

use chrono::NaiveDate;
use core::fmt;
use serde::{
    Deserialize,
    Serialize,
};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
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
