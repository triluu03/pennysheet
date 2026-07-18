//! Domain errors.

use core::fmt;
use serde::Serialize;
use std::num::ParseFloatError;

#[derive(Debug, Serialize)]
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

#[cfg(test)]
mod tests {
    use super::DomainError;

    /// Each [`DomainError`] variant formats with its documented prefix.
    #[test]
    fn display_formats_each_variant_with_expected_prefix() {
        assert_eq!(
            DomainError::CommandCreation("test".into()).to_string(),
            "Failed to create command: test"
        );
        assert_eq!(
            DomainError::CommandRejected("reason".into()).to_string(),
            "Command rejected: reason"
        );
        assert_eq!(
            DomainError::EventCreation("err".into()).to_string(),
            "Failed to create event: err"
        );
        assert_eq!(
            DomainError::ComponentInit("init".into()).to_string(),
            "Failed to initialize domain component: init"
        );
        assert_eq!(
            DomainError::Parsing("parse".into()).to_string(),
            "Error occur when parsing values: parse"
        );
    }

    /// Chrono parse failures map into [`DomainError::CommandCreation`].
    #[test]
    fn from_chrono_parse_error_maps_to_command_creation() {
        use chrono::NaiveDate;
        let err = NaiveDate::parse_from_str("not-a-date", "%Y-%m-%d").unwrap_err();
        let domain_err: DomainError = err.into();
        assert!(matches!(domain_err, DomainError::CommandCreation(_)));
    }

    /// Float parse failures map into [`DomainError::EventCreation`].
    #[test]
    fn from_parse_float_error_maps_to_event_creation() {
        let err = "abc".parse::<f64>().unwrap_err();
        let domain_err: DomainError = err.into();
        assert!(matches!(domain_err, DomainError::EventCreation(_)));
    }

    /// UUID parse failures map into [`DomainError::CommandCreation`].
    #[test]
    fn from_uuid_error_maps_to_command_creation() {
        use std::str::FromStr;
        use uuid::Uuid;
        let err = Uuid::from_str("not-a-uuid").unwrap_err();
        let domain_err: DomainError = err.into();
        assert!(matches!(domain_err, DomainError::CommandCreation(_)));
    }
}
