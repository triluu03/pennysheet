//! Domain errors.

use core::fmt;
use std::num::ParseFloatError;

#[derive(Debug)]
pub enum DomainError {
    CommandCreation(String),
    CommandRejected(String),
    EventCreation(String),
    ComponentInit(String),
    Parsing(String),
}

impl fmt::Display for DomainError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::CommandRejected(message) => write!(f, "Command rejected: {message}"),
            Self::CommandCreation(message) => write!(f, "Failed to create command: {message}"),
            Self::EventCreation(message) => write!(f, "Failed to create event: {message}"),
            Self::ComponentInit(message) => {
                write!(f, "Failed to initialize domain component: {message}")
            },
            Self::Parsing(message) => write!(f, "Error occur when parsing values: {message}"),
        }
    }
}

impl From<chrono::ParseError> for DomainError {
    fn from(value: chrono::ParseError) -> Self {
        Self::CommandCreation(value.to_string())
    }
}

impl From<ParseFloatError> for DomainError {
    fn from(value: ParseFloatError) -> Self {
        Self::EventCreation(value.to_string())
    }
}

impl From<uuid::Error> for DomainError {
    fn from(value: uuid::Error) -> Self {
        Self::CommandCreation(value.to_string())
    }
}
