//! Budgets-related event data.

use core::fmt;

use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

pub type BudgetId = Uuid;

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
    pub budget_id: BudgetId,
    pub budget_type: BudgetType,
    pub amount: f64,
    /// The threshold below which transactions are counted towards the budget.
    pub threshold: f64,
}

/// UUID namespace for Budget Data.
const NAMESPACE_BUDGET_DATA: Uuid = Uuid::from_bytes([
    0x6b, 0xa6, 0xb7, 0x14, 0x9d, 0xad, 0x14, 0xd1, 0x9b, 0xb4, 0x00, 0xc0, 0x4f, 0xd4, 0x30, 0xc8,
]);

impl BudgetData {
    /// Constructor
    pub fn new(budget_type: BudgetType, amount: f64, threshold: f64) -> Self {
        let budget_id = Uuid::new_v5(
            &NAMESPACE_BUDGET_DATA,
            format!("budget_data:{budget_type}").as_bytes(),
        );
        Self {
            budget_id,
            budget_type,
            amount,
            threshold,
        }
    }
}
