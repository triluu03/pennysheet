//! Client to work with Enable Banking API.

use std::time::{
    SystemTime,
    UNIX_EPOCH,
};
use tracing::{
    debug,
    error,
    info,
    instrument,
};

use crate::{
    authorization::jwt::generate_jwt_token,
    errors::GatewayError,
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

#[derive(Debug)]
pub struct EnableBankingClient {
    session: EnableBankingSession,
    bearer_token: BearerToken,
    http: reqwest::Client,
    /// Base URL of the Enable Banking API. Defaults to [`ENABLE_BANKING_BASE_URL`]
    /// in [`EnableBankingClient::new`]; held as a field so tests can redirect
    /// requests to a local mock server.
    base_url: String,
}

#[derive(Debug, Clone)]
struct BearerToken {
    pub token: String,
    pub expires_at: u64,
}

impl BearerToken {
    /// Check whether the token has expired.
    ///
    /// # Panics
    ///
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
    ///
    /// Returns [`GatewayError`] if fails to generate the JWT token.
    pub fn new(session: EnableBankingSession) -> Result<Self, GatewayError> {
        let (jwt_token, expires_at) = generate_jwt_token()?;

        Ok(Self {
            session,
            bearer_token: BearerToken {
                token: jwt_token,
                expires_at,
            },
            http: reqwest::Client::new(),
            base_url: ENABLE_BANKING_BASE_URL.to_string(),
        })
    }

    /// Get the encoded JWT token.
    ///
    /// # Errors
    ///
    /// Returns [`GatewayError::Authorization`] if the token has expired.
    fn get_token(&self) -> Result<&String, GatewayError> {
        if self.bearer_token.is_expired() {
            Err(GatewayError::Authorization(
                "The token has expired!".to_string(),
            ))
        } else {
            Ok(&self.bearer_token.token)
        }
    }

    /// Get account balances.
    ///
    /// # Errors
    ///
    /// Returns [`GatewayError`] in any of the following scenarios:
    /// - The JWT token has expired.
    /// - No accounts are found in the provided session.
    /// - Failed to invoke the API endpoint: /accounts/{account_id}/balances
    /// - Enable Banking API returns a failed response.
    /// - Failed to parse 200 response into [`BalanceResponse`] struct.
    #[instrument(skip(self))]
    pub async fn get_account_balances(&self) -> Result<BalanceResponse, GatewayError> {
        let bearer_token = self.get_token()?;
        let account_uid = self.session.get_account_uid()?;
        let base_url = &self.base_url;

        debug!(%account_uid, "requesting account balances from Enable Banking API");
        let response = self
            .http
            .get(format!("{base_url}/accounts/{account_uid}/balances"))
            .bearer_auth(bearer_token)
            .send()
            .await?;

        match response.status().as_u16() {
            200 => {
                info!(%account_uid, "fetched account balances");
                response
                    .json()
                    .await
                    .map_err(|err| GatewayError::Parsing(err.to_string()))
            },
            code => {
                error!(%account_uid, code, "failed to fetch account balances");
                Err(GatewayError::Api(format!(
                    "Failed to get balances. Received code: {code}"
                )))
            },
        }
    }

    /// Get account transactions.
    ///
    /// # Errors
    ///
    /// Returns [`GatewayError`] in any of the following scenarios:
    /// - The JWT token has expired.
    /// - No accounts are found in the provided session.
    /// - Failed to invoke the API endpoint: /accounts/{account_id}/transactions
    /// - Enable Banking API returns a failed response.
    /// - Failed to parse 200 response into [`TransactionResponse`] struct.
    #[instrument(skip(self))]
    pub async fn get_transactions(
        &self,
        query_params: TransactionQueryParameters,
    ) -> Result<TransactionResponse, GatewayError> {
        let bearer_token = self.get_token()?;
        let account_uid = self.session.get_account_uid()?;
        let base_url = &self.base_url;

        debug!(
            %account_uid,
            date_from = ?query_params.date_from,
            date_to = ?query_params.date_to,
            has_continuation = query_params.continuation_key.is_some(),
            "requesting transactions from Enable Banking",
        );
        let response = self
            .http
            .get(format!("{base_url}/accounts/{account_uid}/transactions"))
            .bearer_auth(bearer_token)
            .query(&query_params)
            .send()
            .await?;

        match response.status().as_u16() {
            200 => {
                info!(%account_uid, "fetched transactions");
                response
                    .json()
                    .await
                    .map_err(|err| GatewayError::Parsing(err.to_string()))
            },
            code => {
                let message = response.text().await.unwrap_or("No message!".to_string());
                error!(%account_uid, code, message, "failed to fetch transactions");
                Err(GatewayError::Api(format!(
                    "Failed to get transactions. Received code: {code}"
                )))
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use serde_json::json;

    /// A representative single-account session whose account uid is `acc-uid-1`,
    /// matching the paths the mock server is configured to expect.
    const SAMPLE_SESSION: &str = r#"{
        "session_id": "sess-123",
        "accounts": [{"name": "Checking", "currency": "EUR", "uid": "acc-uid-1"}],
        "aspsp": {"name": "Mock Bank", "country": "FI"},
        "psu_type": "personal",
        "access": {"valid_until": "2026-12-31T23:59:59Z"}
    }"#;

    /// Build a client wired to `base_url` with a fixed bearer token expiring at
    /// `expires_at`. This bypasses the env/JWT path in [`EnableBankingClient::new`]
    /// so the HTTP methods can be exercised in isolation against a mock server.
    fn build_client(base_url: String, expires_at: u64) -> EnableBankingClient {
        EnableBankingClient {
            session: EnableBankingSession::from_json(SAMPLE_SESSION)
                .expect("sample session should parse"),
            bearer_token: BearerToken {
                token: "test-bearer-token".to_string(),
                expires_at,
            },
            http: reqwest::Client::new(),
            base_url,
        }
    }

    /// Current UNIX time in seconds, mirroring the production clock read.
    fn now_secs() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock is after the UNIX epoch")
            .as_secs()
    }

    /// A token expiring well beyond the 30-second skew is not considered expired.
    #[test]
    fn token_far_in_future_is_not_expired() {
        let token = BearerToken {
            token: "token".to_string(),
            expires_at: now_secs() + 3600,
        };
        assert!(!token.is_expired());
    }

    /// A token expiring within the 30-second safety skew is treated as expired.
    #[test]
    fn token_within_skew_window_is_expired() {
        let token = BearerToken {
            token: "token".to_string(),
            expires_at: now_secs() + 10,
        };
        assert!(token.is_expired());
    }

    /// A token whose expiry is already in the past is expired.
    #[test]
    fn token_in_past_is_expired() {
        let token = BearerToken {
            token: "token".to_string(),
            expires_at: now_secs() - 3600,
        };
        assert!(token.is_expired());
    }

    /// A 200 response on the balances endpoint is parsed into a [`BalanceResponse`],
    /// and the request carries the bearer token on the expected path.
    #[tokio::test]
    async fn get_account_balances_parses_200_response() {
        let server = MockServer::start_async().await;
        let mock = server
            .mock_async(|when, then| {
                when.method(GET)
                    .path("/accounts/acc-uid-1/balances")
                    .header("authorization", "Bearer test-bearer-token");
                then.status(200)
                    .header("content-type", "application/json")
                    .json_body(json!({
                        "balances": [
                            {
                                "name": "CLBD",
                                "balance_amount": {"currency": "EUR", "amount": "100.00"}
                            }
                        ]
                    }));
            })
            .await;

        let client = build_client(server.base_url(), now_secs() + 3600);
        let result = client.get_account_balances().await;

        mock.assert_async().await;
        assert!(result.is_ok(), "expected Ok, got {result:?}");
    }

    /// A non-200 response on the balances endpoint surfaces an error that names
    /// the status code.
    #[tokio::test]
    async fn get_account_balances_errors_on_non_200() {
        let server = MockServer::start_async().await;
        let mock = server
            .mock_async(|when, then| {
                when.method(GET).path("/accounts/acc-uid-1/balances");
                then.status(500);
            })
            .await;

        let client = build_client(server.base_url(), now_secs() + 3600);
        let result = client.get_account_balances().await;

        mock.assert_async().await;
        let err = result
            .expect_err("non-200 should produce an error")
            .to_string();
        assert!(
            err.contains("500"),
            "error should mention the status code: {err}"
        );
    }

    /// The transactions query parameters are forwarded as URL query string, and a
    /// 200 response is parsed into a [`TransactionResponse`].
    #[tokio::test]
    async fn get_transactions_forwards_query_params_and_parses_200() {
        let server = MockServer::start_async().await;
        let mock = server
            .mock_async(|when, then| {
                when.method(GET)
                    .path("/accounts/acc-uid-1/transactions")
                    .query_param("date_from", "2026-01-01")
                    .query_param("date_to", "2026-01-31");
                then.status(200)
                    .header("content-type", "application/json")
                    .json_body(json!({
                        "transactions": [
                            {
                                "transaction_amount": {"currency": "EUR", "amount": "42.00"},
                                "creditor": {"name": "Coffee Shop"},
                                "debtor": null,
                                "booking_date": "2026-01-02",
                                "transaction_date": "2026-01-01"
                            }
                        ],
                        "continuation_key": null
                    }));
            })
            .await;

        let query_params = TransactionQueryParameters {
            date_from: Some("2026-01-01".to_string()),
            date_to: Some("2026-01-31".to_string()),
            continuation_key: None,
        };
        let client = build_client(server.base_url(), now_secs() + 3600);
        let result = client.get_transactions(query_params).await;

        mock.assert_async().await;
        assert!(result.is_ok(), "expected Ok, got {result:?}");
    }

    /// A non-200 response on the transactions endpoint surfaces an error that names
    /// the status code.
    #[tokio::test]
    async fn get_transactions_errors_on_non_200() {
        let server = MockServer::start_async().await;
        let mock = server
            .mock_async(|when, then| {
                when.method(GET).path("/accounts/acc-uid-1/transactions");
                then.status(400);
            })
            .await;

        let client = build_client(server.base_url(), now_secs() + 3600);
        let result = client
            .get_transactions(TransactionQueryParameters::default())
            .await;

        mock.assert_async().await;
        let err = result
            .expect_err("non-200 should produce an error")
            .to_string();
        assert!(
            err.contains("400"),
            "error should mention the status code: {err}"
        );
    }

    /// An expired bearer token short-circuits before any HTTP request is made.
    #[tokio::test]
    async fn expired_token_short_circuits_before_request() {
        let server = MockServer::start_async().await;
        let mock = server
            .mock_async(|when, then| {
                when.method(GET).path("/accounts/acc-uid-1/balances");
                then.status(200).json_body(json!({ "balances": [] }));
            })
            .await;

        // Expiry is in the past, so `get_token` must reject before sending.
        let client = build_client(server.base_url(), now_secs() - 3600);
        let result = client.get_account_balances().await;

        assert_eq!(mock.calls_async().await, 0, "no request should be sent");
        let err = result.expect_err("expired token should error").to_string();
        assert!(
            err.contains("expired"),
            "error should mention expiry: {err}"
        );
    }

    // TODO: add tests for EnableBankingClient::new once JWT generation can be exercised without private-key env fixtures.
}
