//! Framework-agnostic shared error type.

use std::fmt;

use domain::errors::DomainError;
use gateway::errors::GatewayError;

/// Framework-agnostic service error.
#[derive(Debug)]
pub enum ServiceError {
    /// Domain layer error.
    Domain(DomainError),
    /// Database error.
    Database(infra::DatabaseError),
    /// Gateway error.
    Gateway(GatewayError),
    /// Not implemented error.
    NotImplemented(String),
    /// Serialization error.
    Serialization(String),
    /// Expired session error.
    ExpiredSession,
}

/// Convenience alias for [`std::result::Result`] with the shared [`ServiceError`] type.
pub type Result<T> = std::result::Result<T, ServiceError>;

impl fmt::Display for ServiceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Domain(error) => write!(f, "Domain error: {error}"),
            Self::Database(error) => write!(f, "Database error: {error}"),
            Self::Gateway(error) => write!(f, "Gateway error: {error}"),
            Self::NotImplemented(error) => {
                write!(f, "Requested resource is not supported: {error}")
            },
            Self::Serialization(error) => write!(f, "Serialization error: {error}"),
            Self::ExpiredSession => write!(f, "One or more sessions is expired!"),
        }
    }
}

impl std::error::Error for ServiceError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Domain(error) => Some(error),
            Self::Database(error) => Some(error),
            Self::Gateway(error) => Some(error),
            Self::NotImplemented(_) | Self::Serialization(_) | Self::ExpiredSession => None,
        }
    }
}

impl From<DomainError> for ServiceError {
    fn from(value: DomainError) -> Self {
        Self::Domain(value)
    }
}

impl From<infra::DatabaseError> for ServiceError {
    fn from(value: infra::DatabaseError) -> Self {
        Self::Database(value)
    }
}

impl From<GatewayError> for ServiceError {
    fn from(value: GatewayError) -> Self {
        Self::Gateway(value)
    }
}

#[cfg(test)]
mod tests {
    use std::error::Error as _;

    use super::ServiceError;

    /// The wrapped domain error is exposed through [`ServiceError::source`].
    #[test]
    fn source_forwards_domain_error() {
        let error = ServiceError::from(domain::errors::DomainError::Parsing("bad".into()));
        assert!(
            error
                .source()
                .and_then(|source| source.downcast_ref::<domain::errors::DomainError>())
                .is_some()
        );
    }

    /// The wrapped database error is exposed through [`ServiceError::source`].
    #[test]
    fn source_forwards_database_error() {
        let error = ServiceError::from(infra::DatabaseError::Custom("boom".into()));
        assert!(
            error
                .source()
                .and_then(|source| source.downcast_ref::<infra::DatabaseError>())
                .is_some()
        );
    }

    /// The wrapped gateway error is exposed through [`ServiceError::source`].
    #[test]
    fn source_forwards_gateway_error() {
        let error = ServiceError::from(gateway::errors::GatewayError::Api("500".into()));
        assert!(
            error
                .source()
                .and_then(|source| source.downcast_ref::<gateway::errors::GatewayError>())
                .is_some()
        );
    }

    /// Leaf variants have no underlying error.
    #[test]
    fn source_is_none_for_leaf_variants() {
        assert!(
            ServiceError::NotImplemented("not ready".into())
                .source()
                .is_none()
        );
        assert!(ServiceError::ExpiredSession.source().is_none());
        assert!(
            ServiceError::Serialization("bad json".into())
                .source()
                .is_none()
        );
    }
}
