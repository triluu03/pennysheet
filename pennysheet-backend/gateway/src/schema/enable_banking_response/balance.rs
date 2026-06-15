//! Schema for response from `/accounts/{account_id}/balances`

use serde::{
    Deserialize,
    Serialize,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct BalanceResponse {
    balances: Vec<BalanceResource>,
}

#[derive(Debug, Serialize, Deserialize)]
struct BalanceResource {
    name: String,
    balance_amount: AmountType,
}

#[derive(Debug, Serialize, Deserialize)]
struct AmountType {
    currency: String,
    amount: String,
}
