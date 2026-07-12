//! Events.

#[cfg(feature = "sea-orm-support")]
use sea_orm::FromJsonQueryResult;
use serde::{
    Deserialize,
    Serialize,
};

pub mod budgets;
pub mod transactions;

pub use crate::shared_schema::*;
use budgets::*;
use transactions::*;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "sea-orm-support", derive(FromJsonQueryResult))]
pub enum Event {
    /// A new transaction import is requested.
    ImportTransactionsRequested(ImportRequestData),
    /// A pending import request has completed.
    ImportTransactionsCompleted(ImportStatusData),
    /// A pending import request has failed.
    ImportTransactionsFailed(ImportStatusData),
    /// A pending import request continues with a continuation key.
    ImportTransactionsContinued(ImportContinueData),
    /// A retry for a failed transaction import is requested.
    // TODO: use a better name for the data part instead of `ImportStatusData`?
    TransactionImportRetryRequested(ImportStatusData),
    /// A transaction is recorded.
    TransactionRecorded(TransactionData),
    /// A transaction is categorized.
    TransactionCategorized(TransactionCategoryData),
    /// A transaction is classified.
    TransactionClassified(TransactionClassificationData),
    /// A transaction's note is updated.
    TransactionNoteUpdated(TransactionNoteData),
    /// A new budget is created.
    BudgetCreated(BudgetData),
    /// A budget is updated.
    BudgetUpdated(BudgetData),
    /// A budget is deleted.
    BudgetDeleted(BudgetId),
    /// A budget has been exceeded.
    BudgetExceeded(BudgetId),
    /// A budget is reset.
    BudgetReset(BudgetId),
}
