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
    transaction_id: Uuid,
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

/// UUID namespace for Transactions Data.
pub const NAMESPACE_TRANSACTION_DATA: Uuid = Uuid::from_bytes([
    0x6b, 0xa6, 0xb7, 0x14, 0x9d, 0xad, 0x11, 0xd1, 0x80, 0xb4, 0x00, 0xc0, 0x4f, 0xd4, 0x30, 0xc8,
]);

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
        let amount = transaction.transaction_amount.amount.parse::<f64>()?;
        let currency = transaction.transaction_amount.currency;
        let creditor_name = transaction.creditor.and_then(|info| info.name);
        let debtor_name = transaction.debtor.and_then(|info| info.name);

        let transaction_id = Uuid::new_v5(
            &NAMESPACE_TRANSACTION_DATA,
            format!(
                "transaction_data:{}:{}:{amount}:{currency}:{}:{}",
                booking_date.map_or("None".to_string(), |v| v.to_string()),
                transaction_date.map_or("None".to_string(), |v| v.to_string()),
                creditor_name.clone().unwrap_or("None".to_string()),
                debtor_name.clone().unwrap_or("None".to_string()),
            )
            .as_bytes(),
        );

        Ok(Self {
            transaction_id,
            booking_date,
            transaction_date,
            amount,
            currency,
            creditor_name,
            debtor_name,
            category: None,
            classification: None,
            note: None,
        })
    }

    /// Get transaction ID.
    pub fn get_transaction_id(&self) -> &Uuid {
        &self.transaction_id
    }
}
