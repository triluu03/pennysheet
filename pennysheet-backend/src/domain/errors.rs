//! Domain errors.

use core::fmt;

use sea_orm::sea_query::prelude::chrono;

pub enum DomainError {
    ParseCommandFailed(String),
    CommandRejected(String),
}

impl fmt::Display for DomainError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ParseCommandFailed(message) => {
                write!(f, "Parsing command from payload failed: {message}")
            },
            Self::CommandRejected(message) => write!(f, "Command rejected: {message}"),
        }
    }
}

impl From<chrono::ParseError> for DomainError {
    fn from(value: chrono::ParseError) -> Self {
        Self::ParseCommandFailed(value.to_string())
    }
}
