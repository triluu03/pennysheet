//! Events.

#[cfg(feature = "sea-orm-support")]
use sea_orm::FromJsonQueryResult;
use serde::{
    Deserialize,
    Serialize,
};

pub mod transactions;

use transactions::*;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "sea-orm-support", derive(FromJsonQueryResult))]
pub enum Event {
    // Transactions-related events.
    ImportTransactionsRequested(ImportRequestData),
    ImportTransactionsCompleted(ImportStatusData),
    ImportTransactionsFailed(ImportStatusData),
    ImportTransactionsContinued(ImportContinueData),
    TransactionRecorded(TransactionData),
}
