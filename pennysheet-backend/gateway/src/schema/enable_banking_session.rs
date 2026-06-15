//! Enable Banking Session.
//!
//! This is used as the base authentication for every API call to Enable Banking API.

use serde::{
    Deserialize,
    Serialize,
};

#[derive(Serialize, Deserialize)]
pub struct EnableBankingSession {
    session_id: String,
    accounts: Vec<AccountResource>,
    aspsp: ASPSP,
    psu_type: PSUType,
    access: Access,
}

#[derive(Serialize, Deserialize)]
struct AccountResource {
    name: Option<String>,
    currency: String,
    uid: String,
}

#[derive(Serialize, Deserialize)]
#[allow(clippy::upper_case_acronyms)]
struct ASPSP {
    name: String,
    country: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
enum PSUType {
    Business,
    Personal,
}

#[derive(Serialize, Deserialize)]
struct Access {
    valid_until: String,
}

impl EnableBankingSession {
    /// Construct [`EnableBankingSession`] from JSON payload.
    ///
    /// # Errors
    /// Returns [`serde_json::Error`] if parsing the JSON payload fails.
    pub fn from_json(session_json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(session_json)
    }

    /// Get account UUID.
    ///
    /// TODO: How to generalize this to support a session with multiple accounts?
    ///
    /// # Errors
    /// Returns [`String`] error if no accounts are found in the provided session.
    pub fn get_account_uid(&self) -> Result<&String, String> {
        if self.accounts.len() == 0 {
            Err("No accounts found in the provided session!".to_string())
        } else {
            Ok(&self.accounts[0].uid)
        }
    }
}
