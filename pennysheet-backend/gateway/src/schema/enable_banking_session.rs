//! Enable Banking Session.
//!
//! This is used as the base authentication for every API call to Enable Banking API.

use chrono::{
    DateTime,
    Duration,
    Utc,
};
#[cfg(feature = "sea-orm-support")]
use sea_orm::FromJsonQueryResult;
use serde::{
    Deserialize,
    Serialize,
};

use crate::errors::GatewayError;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[cfg_attr(feature = "sea-orm-support", derive(FromJsonQueryResult))]
pub struct EnableBankingSession {
    session_id: String,
    accounts: Vec<AccountResource>,
    aspsp: ASPSP,
    psu_type: PSUType,
    access: Access,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct AccountResource {
    name: Option<String>,
    currency: String,
    uid: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[allow(clippy::upper_case_acronyms)]
struct ASPSP {
    name: String,
    country: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
enum PSUType {
    Business,
    Personal,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct Access {
    valid_until: DateTime<Utc>,
}

impl EnableBankingSession {
    /// Construct [`EnableBankingSession`] from JSON payload.
    ///
    /// # Errors
    ///
    /// Returns [`GatewayError`] if parsing the JSON payload fails.
    pub fn from_json(session_json: &str) -> Result<Self, GatewayError> {
        Ok(serde_json::from_str(session_json)?)
    }

    /// Check whether the session has expired.
    pub fn is_expired(&self) -> bool {
        Utc::now() > self.access.valid_until - Duration::minutes(5)
    }

    /// Get account UUID.
    ///
    /// TODO: How to generalize this to support a session with multiple accounts?
    ///
    /// # Errors
    ///
    /// Returns [`GatewayError`] if no accounts are found in the provided session.
    pub fn get_account_uid(&self) -> Result<&String, GatewayError> {
        if self.accounts.is_empty() {
            Err(GatewayError::Session(
                "No accounts found in the provided session!".to_string(),
            ))
        } else {
            Ok(&self.accounts[0].uid)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A representative session payload carrying two accounts. The second account
    /// has a `null` name to exercise the `Option<String>` field.
    const SAMPLE_SESSION: &str = r#"{
        "session_id": "sess-123",
        "accounts": [
            {"name": "Checking", "currency": "EUR", "uid": "acc-uid-1"},
            {"name": null, "currency": "EUR", "uid": "acc-uid-2"}
        ],
        "aspsp": {"name": "Mock Bank", "country": "FI"},
        "psu_type": "personal",
        "access": {"valid_until": "2026-12-31T23:59:59Z"}
    }"#;

    /// A valid payload parses and `get_account_uid` returns the first account's uid.
    #[test]
    fn from_json_parses_valid_session_and_returns_first_uid() {
        let session =
            EnableBankingSession::from_json(SAMPLE_SESSION).expect("sample session should parse");
        let uid = session
            .get_account_uid()
            .expect("first account uid should be present");
        assert_eq!(uid, "acc-uid-1");
    }

    /// `psu_type` is deserialized from its snake_case wire representation.
    #[test]
    fn from_json_parses_snake_case_psu_type() {
        let session =
            EnableBankingSession::from_json(SAMPLE_SESSION).expect("sample session should parse");
        assert!(matches!(session.psu_type, PSUType::Personal));
    }

    /// `get_account_uid` errors when the session carries no accounts.
    #[test]
    fn get_account_uid_errors_on_empty_accounts() {
        let payload = r#"{
            "session_id": "sess-123",
            "accounts": [],
            "aspsp": {"name": "Mock Bank", "country": "FI"},
            "psu_type": "business",
            "access": {"valid_until": "2026-12-31T23:59:59Z"}
        }"#;
        let session =
            EnableBankingSession::from_json(payload).expect("empty-accounts payload should parse");
        assert!(session.get_account_uid().is_err());
    }

    /// Malformed JSON surfaces a parse error rather than panicking.
    #[test]
    fn from_json_rejects_invalid_payload() {
        assert!(EnableBankingSession::from_json("{ not valid json ").is_err());
    }
}
