//! Client to work with Enable Banking API.

use std::time::{
    SystemTime,
    UNIX_EPOCH,
};

use crate::{
    authorization::jwt::generate_jwt_token,
    schema::{
        enable_banking_api::{
            balance::BalanceResponse,
            transaction::{
                TransactionQueryParameters,
                TransactionResponse,
            },
        },
        enable_banking_session::EnableBankingSession,
    },
};

/// Base URL of Enable Banking API.
const ENABLE_BANKING_BASE_URL: &str = "https://api.enablebanking.com";

pub struct EnableBankingClient {
    session: EnableBankingSession,
    bearer_token: BearerToken,
    http: reqwest::Client,
}

struct BearerToken {
    pub token: String,
    pub expires_at: u64,
}

impl BearerToken {
    /// Check whether the token has expired.
    ///
    /// # Panics
    /// Panics when failed to access the [`SystemTime`].
    fn is_expired(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        now >= self.expires_at - 30
    }
}

impl EnableBankingClient {
    /// Constructor.
    ///
    /// # Errors
    /// Returns [`String`] error in any of the following scenarios:
    /// - Cannot generate the JWT token.
    /// - Fail to parse the session JSON.
    pub fn new(session_json: &str) -> Result<Self, String> {
        let (jwt_token, expires_at) = generate_jwt_token()?;

        let session =
            EnableBankingSession::from_json(session_json).map_err(|err| err.to_string())?;

        Ok(Self {
            session,
            bearer_token: BearerToken {
                token: jwt_token,
                expires_at,
            },
            http: reqwest::Client::new(),
        })
    }

    /// Get the encoded JWT token.
    ///
    /// # Errors
    /// Returns [`String`] error if the token has expired.
    fn get_token(&self) -> Result<&String, String> {
        if self.bearer_token.is_expired() {
            Err("The token has expired!".to_string())
        } else {
            Ok(&self.bearer_token.token)
        }
    }

    /// Get account balances.
    ///
    /// # Errors
    /// Returns [`String`] error in any of the following scenarios:
    /// - The JWT token has expired.
    /// - Failed to invoke the API endpoint: /accounts/{account_id}/balances
    /// - Enable Banking API returns a failed response.
    /// - Failed to parse 200 response into [`BalanceResponse`] struct.
    pub async fn get_account_balances(&self) -> Result<BalanceResponse, String> {
        let bearer_token = self.get_token()?;
        let account_uid = self.session.get_account_uid();

        let response = self
            .http
            .get(format!(
                "{ENABLE_BANKING_BASE_URL}/accounts/{account_uid}/balances"
            ))
            .bearer_auth(bearer_token)
            .send()
            .await
            .map_err(|err| err.to_string())?;

        match response.status().as_u16() {
            200 => response.json().await.map_err(|err| err.to_string()),
            code => Err(format!("Failed to get balances. Received code: {code}")),
        }
    }

    /// Get account transactions.
    ///
    /// # Errors
    /// Returns [`String`] error in any of the following scenarios:
    /// - The JWT token has expired.
    /// - Failed to invoke the API endpoint: /accounts/{account_id}/transactions
    /// - Enable Banking API returns a failed response.
    /// - Failed to parse 200 response into [`TransactionResponse`] struct.
    pub async fn get_transactions(
        &self,
        query_params: TransactionQueryParameters,
    ) -> Result<TransactionResponse, String> {
        let bearer_token = self.get_token()?;
        let account_uid = self.session.get_account_uid();

        let response = self
            .http
            .get(format!(
                "{ENABLE_BANKING_BASE_URL}/accounts/{account_uid}/transactions"
            ))
            .bearer_auth(bearer_token)
            .query(&query_params)
            .send()
            .await
            .map_err(|err| err.to_string())?;

        match response.status().as_u16() {
            200 => response.json().await.map_err(|err| err.to_string()),
            code => Err(format!("Failed to get transactions. Received code: {code}")),
        }
    }
}
