//! Gateway errors.

use core::fmt;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub enum GatewayError {
    /// Authorization related error.
    Authorization(String),
    /// Enable Banking session related error.
    Session(String),
    /// Request-related error.
    Request(String),
    /// External API error.
    Api(String),
    /// Parsing error.
    Parsing(String),
    /// Runtime environment-related error.
    Environment(String),
}

impl fmt::Display for GatewayError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Authorization(message) => write!(f, "Authorization failed: {message}"),
            Self::Session(message) => write!(f, "Invalid session: {message}"),
            Self::Request(message) => write!(f, "Request failed: {message}"),
            Self::Api(message) => write!(f, "API returned an error: {message}"),
            Self::Parsing(message) => write!(f, "Failed to parse response: {message}"),
            Self::Environment(message) => write!(f, "Runtime environment error: {message}"),
        }
    }
}

impl From<reqwest::Error> for GatewayError {
    fn from(value: reqwest::Error) -> Self {
        Self::Request(value.to_string())
    }
}

impl From<serde_json::Error> for GatewayError {
    fn from(value: serde_json::Error) -> Self {
        Self::Session(value.to_string())
    }
}

impl From<std::env::VarError> for GatewayError {
    fn from(value: std::env::VarError) -> Self {
        Self::Environment(value.to_string())
    }
}

impl From<jsonwebtoken::errors::Error> for GatewayError {
    fn from(value: jsonwebtoken::errors::Error) -> Self {
        Self::Authorization(value.to_string())
    }
}
