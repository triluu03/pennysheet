//! Transactions-related event data.

use chrono::NaiveDate;
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportRequestData {
    request_id: Uuid,
    start_date: NaiveDate,
    end_date: NaiveDate,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportCompletedData {
    request_id: Uuid,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportFailedData {
    request_id: Uuid,
}

impl ImportRequestData {
    /// Import transactions requested constructor.
    pub fn new(start_date: NaiveDate, end_date: NaiveDate) -> Self {
        let uuid_key = "ImportRequestData:".to_string()
            + &start_date.to_string()
            + ":"
            + &end_date.to_string();

        ImportRequestData {
            request_id: Uuid::new_v5(&Uuid::NAMESPACE_OID, uuid_key.as_bytes()),
            start_date,
            end_date,
        }
    }
}
