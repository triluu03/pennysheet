//! Transactions-related events.

use sea_orm::prelude::Date;
use serde::{
    Deserialize,
    Serialize,
};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportTransactionsRequested {
    request_id: String,
    start_date: Date,
    end_date: Date,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportTransactionsCompleted {
    request_id: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportTransactionsFailed {
    request_id: String,
}

impl ImportTransactionsRequested {
    /// Import transactions requested constructor.
    pub fn new(start_date: Date, end_date: Date) -> Self {
        ImportTransactionsRequested {
            request_id: "1".to_string(),
            start_date,
            end_date,
        }
    }
}
