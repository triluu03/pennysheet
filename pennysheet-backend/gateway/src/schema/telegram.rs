//! Schema for the Telegram Bot API.

use serde::{
    Deserialize,
    Serialize,
};

/// Request body for the [`sendMessage`](https://core.telegram.org/bots/api#sendmessage)
/// endpoint of the Telegram Bot API.
#[derive(Debug, Serialize)]
pub struct SendMessageRequest {
    /// Unique identifier for the target chat or username of the target channel.
    pub chat_id: String,
    /// Text of the message to be sent (1-4096 characters after entities parsing).
    pub text: String,
    /// Mode for parsing entities in the message text. Always `"HTML"` for
    /// the messages produced by this application.
    pub parse_mode: String,
}

/// Response body returned by the [`sendMessage`](https://core.telegram.org/bots/api#sendmessage)
/// endpoint.
#[derive(Debug, Deserialize)]
pub struct SendMessageResponse {
    /// `true` when the request succeeded.
    pub ok: bool,
    /// Human-readable description of the result. Contains an error reason when
    /// `ok` is `false`.
    #[serde(default)]
    pub description: Option<String>,
}
