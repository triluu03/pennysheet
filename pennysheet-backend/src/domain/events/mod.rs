//! Events.

use sea_orm::FromJsonQueryResult;
use serde::{
    Deserialize,
    Serialize,
};

pub mod transactions;

use transactions::*;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, FromJsonQueryResult)]
pub enum Event {
    // Transactions-related events.
    ImportTransactionsRequested(ImportRequestData),
    ImportTransactionsCompleted(ImportStatusData),
    ImportTransactionsFailed(ImportStatusData),
}
