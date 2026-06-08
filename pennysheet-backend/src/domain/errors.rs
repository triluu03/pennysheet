//! Domain errors.

use core::fmt;

pub enum DomainError {
    CommandRejected(String),
}

impl fmt::Display for DomainError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::CommandRejected(message) => write!(f, "Command rejected: {message}"),
        }
    }
}
