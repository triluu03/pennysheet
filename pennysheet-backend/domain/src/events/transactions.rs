//! Transactions-related event data.

use chrono::NaiveDate;
use gateway::schema::enable_banking_api;
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

use crate::errors::DomainError;

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
    category: Option<TransactionCategory>,
    classification: Option<TransactionClassification>,
    note: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
enum TransactionCategory {
    Groceries,
    Health,
    Transport,
    Services,
    Leisure,
    Others,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
enum TransactionClassification {
    MustHave,
    NiceToHave,
    Wasted,
}

impl TransactionData {
    /// Constructor
    ///
    /// # Errors
    /// Return [`DomainError`] if parsing the values from
    /// [`enable_banking_api::transaction::Transaction`] fails.
    pub fn new(
        transaction: enable_banking_api::transaction::Transaction,
    ) -> Result<Self, DomainError> {
        let booking_date = transaction
            .booking_date
            .map(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d"))
            .transpose()?;
        let transaction_date = transaction
            .transaction_date
            .map(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d"))
            .transpose()?;

        Ok(Self {
            booking_date,
            transaction_date,
            amount: transaction.transaction_amount.amount.parse::<f64>()?,
            currency: transaction.transaction_amount.currency,
            creditor_name: transaction.creditor.and_then(|info| info.name),
            debtor_name: transaction.debtor.and_then(|info| info.name),
            category: None,
            classification: None,
            note: None,
        })
    }
}
