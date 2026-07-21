//! Budgets-related commands.

use chrono::NaiveDate;

use crate::events::budgets::BudgetType;

#[derive(Debug, Clone)]
pub struct NewBudgetData {
    pub start_date: NaiveDate,
    pub budget_type: BudgetType,
    pub amount: f64,
    pub threshold: f64,
}

#[derive(Debug, Clone)]
pub struct BudgetUpdateData {
    pub start_date: NaiveDate,
    pub budget_type: BudgetType,
    pub amount: f64,
    pub threshold: f64,
}
