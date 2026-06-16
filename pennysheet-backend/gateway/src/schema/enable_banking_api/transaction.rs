//! Schema for working with `/accounts/{account_id}/transactions`

use serde::{
    Deserialize,
    Serialize,
};

use crate::schema::enable_banking_api::AmountType;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct TransactionQueryParameters {
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    pub continuation_key: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionResponse {
    pub transactions: Vec<Transaction>,
    pub continuation_key: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub transaction_amount: AmountType,
    pub creditor: Option<PartyIdentification>,
    pub debtor: Option<PartyIdentification>,
    pub booking_date: Option<String>,
    pub transaction_date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PartyIdentification {
    pub name: Option<String>,
}
