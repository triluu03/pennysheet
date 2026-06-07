//! Events.

use sea_orm::FromJsonQueryResult;
use serde::{
    Deserialize,
    Serialize,
};

pub mod transactions;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, FromJsonQueryResult)]
pub enum Event {
    // Transactions-related events.
    ImportTransactionsRequested(transactions::ImportTransactionsRequested),
    ImportTransactionsCompleted(transactions::ImportTransactionsCompleted),
    ImportTransactionsFailed(transactions::ImportTransactionsFailed),
}
