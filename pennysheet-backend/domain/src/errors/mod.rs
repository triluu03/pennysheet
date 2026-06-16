//! Domain errors.

use chrono::ParseError;
use core::fmt;
use std::num::ParseFloatError;

#[derive(Debug)]
pub enum DomainError {
    CommandCreation(String),
    CommandRejected(String),
    EventCreation(String),
    ComponentInit(String),
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
        }
    }
}

impl From<ParseError> for DomainError {
    fn from(value: ParseError) -> Self {
        Self::CommandCreation(value.to_string())
    }
}

impl From<ParseFloatError> for DomainError {
    fn from(value: ParseFloatError) -> Self {
        Self::EventCreation(value.to_string())
    }
}
