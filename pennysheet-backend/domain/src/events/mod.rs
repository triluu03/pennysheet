//! Events.

#[cfg(feature = "sea-orm-support")]
use sea_orm::FromJsonQueryResult;
use serde::{
    Deserialize,
    Serialize,
};
use std::fmt;
use strum::{
    Display as StrumDisplay,
    EnumDiscriminants,
};

pub mod transactions;

pub use crate::shared_schema::*;
use transactions::*;

/// Domain events.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, EnumDiscriminants)]
#[strum_discriminants(name(EventType), derive(StrumDisplay))]
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
}

impl fmt::Display for Event {
    /// Formats the event as its variant name (for example `TransactionRecorded`).
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", EventType::from(self))
    }
}
