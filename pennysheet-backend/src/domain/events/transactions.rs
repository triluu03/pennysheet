//! Transactions-related events.

use sea_orm::prelude::Date;
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportTransactionsRequested {
    request_id: Uuid,
    start_date: Date,
    end_date: Date,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportTransactionsCompleted {
    request_id: Uuid,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportTransactionsFailed {
    request_id: Uuid,
}

impl ImportTransactionsRequested {
    /// Import transactions requested constructor.
    pub fn new(start_date: Date, end_date: Date) -> Self {
        let uuid_key = "ImportTransactionsRequested:".to_string()
            + &start_date.to_string()
            + ":"
            + &end_date.to_string();

        ImportTransactionsRequested {
            request_id: Uuid::new_v5(&Uuid::NAMESPACE_OID, uuid_key.as_bytes()),
            start_date,
            end_date,
        }
    }
}
