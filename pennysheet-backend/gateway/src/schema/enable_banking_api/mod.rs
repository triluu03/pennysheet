//! Schemas for Enable Banking API responses

use serde::{
    Deserialize,
    Serialize,
};

pub mod balance;
pub mod transaction;

#[derive(Debug, Serialize, Deserialize)]
struct AmountType {
    currency: String,
    amount: String,
}
