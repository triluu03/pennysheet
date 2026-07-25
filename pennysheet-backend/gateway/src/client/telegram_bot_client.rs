//! Client for the Telegram Bot API.

use tracing::{
    debug,
    info,
    instrument,
};

use crate::{
    errors::GatewayError,
    schema::telegram::{
        SendMessageRequest,
        SendMessageResponse,
    },
};

/// Base URL template for the Telegram Bot API. The `{}` placeholder is
/// replaced with the bot token at construction time.
const TELEGRAM_API_BASE_URL: &str = "https://api.telegram.org/bot{token}";

/// Thin wrapper around [`reqwest::Client`] that knows how to call the Telegram
/// Bot API [`sendMessage`](https://core.telegram.org/bots/api#sendmessage)
/// endpoint.
///
/// # Environment
///
/// Construction via [`TelegramBotClient::new_from_env`] reads:
/// - `TELEGRAM_BOT_TOKEN` — the bot's authorization token.
/// - `TELEGRAM_CHAT_ID` — the target chat identifier.
#[derive(Debug)]
pub struct TelegramBotClient {
    /// Reusable HTTP client.
    http: reqwest::Client,
    /// Base URL with the bot token already substituted.
    base_url: String,
    /// Target chat identifier.
    chat_id: String,
}

impl TelegramBotClient {
    /// Build a client from environment variables.
    ///
    /// # Errors
    ///
    /// Returns [`GatewayError::Environment`] if either `TELEGRAM_BOT_TOKEN` or
    /// `TELEGRAM_CHAT_ID` is not set or is an empty string.
    pub fn new_from_env() -> Result<Self, GatewayError> {
        let token = std::env::var("TELEGRAM_BOT_TOKEN")?;
        let chat_id = std::env::var("TELEGRAM_CHAT_ID")?;

        if token.is_empty() {
            return Err(GatewayError::Environment(
                "TELEGRAM_BOT_TOKEN is set but empty".to_string(),
            ));
        }
        if chat_id.is_empty() {
            return Err(GatewayError::Environment(
                "TELEGRAM_CHAT_ID is set but empty".to_string(),
            ));
        }

        let base_url = TELEGRAM_API_BASE_URL.replace("{token}", &token);

        info!("TelegramBotClient initialized for chat {chat_id}");
        Ok(Self {
            http: reqwest::Client::new(),
            base_url,
            chat_id,
        })
    }

    /// Send a plain-text message to the configured chat.
    ///
    /// Calls the `/sendMessage` endpoint and checks the `ok` field on the
    /// returned JSON.
    ///
    /// # Errors
    ///
    /// Returns [`GatewayError::Request`] if the HTTP call fails, or
    /// [`GatewayError::Api`] if the Telegram API responds with `"ok": false`.
    #[instrument(skip(self))]
    pub async fn send_message(&self, text: &str) -> Result<(), GatewayError> {
        let url = format!("{}/sendMessage", self.base_url);
        let body = SendMessageRequest {
            chat_id: self.chat_id.clone(),
            text: text.to_string(),
        };

        debug!(chat_id = %self.chat_id, "sending Telegram message");
        let response = self.http.post(&url).json(&body).send().await?;

        match response.status().as_u16() {
            200 => {
                let parsed: SendMessageResponse = response
                    .json()
                    .await
                    .map_err(|err| GatewayError::Parsing(err.to_string()))?;
                if parsed.ok {
                    info!(chat_id = %self.chat_id, "Telegram message sent successfully");
                    Ok(())
                } else {
                    let desc = parsed
                        .description
                        .unwrap_or_else(|| "unknown error".to_string());
                    Err(GatewayError::Api(format!(
                        "Telegram API returned not ok: {desc}"
                    )))
                }
            },
            code => {
                let message = response.text().await.unwrap_or_default();
                Err(GatewayError::Api(format!(
                    "Telegram API request failed with status {code}: {message}"
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

    /// Build a client wired to `base_url` with a fixed `chat_id`, bypassing
    /// the env-based constructor so the HTTP method can be exercised against a
    /// mock server.
    fn build_client(base_url: String, chat_id: &str) -> TelegramBotClient {
        TelegramBotClient {
            http: reqwest::Client::new(),
            base_url,
            chat_id: chat_id.to_string(),
        }
    }

    /// A 200 response with `"ok": true` is treated as success.
    #[tokio::test]
    async fn send_message_succeeds_on_ok_response() {
        let server = MockServer::start_async().await;
        let mock = server
            .mock_async(|when, then| {
                when.method(POST)
                    .path("/sendMessage")
                    .header("content-type", "application/json")
                    .json_body(json!({
                        "chat_id": "12345",
                        "text": "hello"
                    }));
                then.status(200)
                    .header("content-type", "application/json")
                    .json_body(json!({
                        "ok": true,
                        "result": {}
                    }));
            })
            .await;

        let client = build_client(server.base_url(), "12345");
        let result = client.send_message("hello").await;

        mock.assert_async().await;
        assert!(result.is_ok(), "expected Ok, got {result:?}");
    }

    /// A 200 response with `"ok": false` produces a [`GatewayError::Api`]
    /// containing the description.
    #[tokio::test]
    async fn send_message_errors_on_not_ok_response() {
        let server = MockServer::start_async().await;
        let mock = server
            .mock_async(|when, then| {
                when.method(POST).path("/sendMessage");
                then.status(200)
                    .header("content-type", "application/json")
                    .json_body(json!({
                        "ok": false,
                        "description": "chat not found"
                    }));
            })
            .await;

        let client = build_client(server.base_url(), "bogus");
        let result = client.send_message("hello").await;

        mock.assert_async().await;
        let err = result
            .expect_err("non-ok should produce an error")
            .to_string();
        assert!(
            err.contains("chat not found"),
            "error should include description: {err}"
        );
    }

    /// A non-200 HTTP status surfaces a [`GatewayError::Api`] that includes
    /// the status code in its message.
    #[tokio::test]
    async fn send_message_errors_on_non_200() {
        let server = MockServer::start_async().await;
        let mock = server
            .mock_async(|when, then| {
                when.method(POST).path("/sendMessage");
                then.status(500).body("Internal Server Error");
            })
            .await;

        let client = build_client(server.base_url(), "12345");
        let result = client.send_message("hello").await;

        mock.assert_async().await;
        let err = result
            .expect_err("non-200 should produce an error")
            .to_string();
        assert!(
            err.contains("status 500"),
            "error should include status code: {err}"
        );
    }
}
