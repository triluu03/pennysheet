//! Schema for working with `/accounts/{account_id}/balances`

use serde::{
    Deserialize,
    Serialize,
};

use crate::schema::enable_banking_api::AmountType;

#[derive(Debug, Serialize, Deserialize)]
pub struct BalanceResponse {
    pub balances: Vec<BalanceResource>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BalanceResource {
    pub name: String,
    pub balance_amount: AmountType,
}
