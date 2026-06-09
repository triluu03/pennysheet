//! Domain errors.

use core::fmt;

use chrono::ParseError;

#[derive(Debug)]
pub enum DomainError {
    CommandCreation(String),
    CommandRejected(String),
}

impl fmt::Display for DomainError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::CommandRejected(message) => write!(f, "Command rejected: {message}"),
            Self::CommandCreation(message) => write!(f, "Failed to create command: {message}"),
        }
    }
}

impl From<ParseError> for DomainError {
    fn from(value: ParseError) -> Self {
        Self::CommandCreation(value.to_string())
    }
}
