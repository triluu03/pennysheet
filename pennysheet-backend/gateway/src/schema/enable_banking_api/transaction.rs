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
    transactions: Vec<Transaction>,
    continuation_key: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Transaction {
    transaction_amount: AmountType,
    creditor: Option<PartyIdentification>,
    debtor: Option<PartyIdentification>,
    booking_date: Option<String>,
    transaction_date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct PartyIdentification {
    name: Option<String>,
}
