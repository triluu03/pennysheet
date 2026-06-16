//! Transactions-related event data.

use chrono::NaiveDate;
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportRequestData {
    pub request_id: Uuid,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
}

impl ImportRequestData {
    /// Import transactions requested constructor.
    pub fn new(start_date: NaiveDate, end_date: NaiveDate) -> Self {
        ImportRequestData {
            request_id: Uuid::new_v4(),
            start_date,
            end_date,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportStatusData {
    pub request_id: Uuid,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportContinueData {
    pub request_id: Uuid,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub continuation_key: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct TransactionData {
    pub booking_date: Option<NaiveDate>,
    pub transaction_date: Option<NaiveDate>,
    pub amount: f64,
    pub currency: String,
    pub creditor_name: Option<String>,
    pub debtor_name: Option<String>,
}
