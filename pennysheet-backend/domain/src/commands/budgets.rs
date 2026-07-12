//! Budgets-related commands.

use crate::events::budgets::{
    BudgetId,
    BudgetType,
};

#[derive(Debug, Clone)]
pub struct NewBudgetData {
    pub budget_type: BudgetType,
    pub amount: f64,
    pub threshold: f64,
}

#[derive(Debug, Clone)]
pub struct BudgetUpdateData {
    pub budget_id: BudgetId,
    pub budget_type: BudgetType,
    pub amount: f64,
    pub threshold: f64,
}
