//! Errors handler.

use axum::{
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use core::fmt;
use domain::errors::DomainError;
use gateway::errors::GatewayError;
use tracing::{
    error,
    warn,
};

#[derive(Debug)]
pub enum AppError {
    Domain(DomainError),
    Database(String),
    Gateway(GatewayError),
    NotImplemented(String),
    ExpiredSession,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Domain(error) => write!(f, "Domain error: {error}"),
            Self::Database(error) => write!(f, "Database error: {error}"),
            Self::Gateway(error) => write!(f, "Gateway error: {error}"),
            Self::NotImplemented(error) => {
                write!(f, "Requested resource is not supported: {error}")
            },
            Self::ExpiredSession => write!(f, "One or more sessions is expired!"),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::Domain(error) => {
                warn!(%error, "command rejected");
                (
                    StatusCode::BAD_REQUEST,
                    Json(serde_json::json!({"message": error})),
                )
                    .into_response()
            },
            Self::Database(error) => {
                error!(%error, "database error while handling request");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(serde_json::json!({"message": error})),
                )
                    .into_response()
            },
            Self::Gateway(error) => {
                error!(%error, "gateway error while handling request");
                (
                    StatusCode::BAD_GATEWAY,
                    Json(serde_json::json!({"message": error})),
                )
                    .into_response()
            },
            Self::NotImplemented(error) => {
                error!(%error, "not implemented error while handling request");
                (
                    StatusCode::BAD_REQUEST,
                    Json(serde_json::json!({"message": error})),
                )
                    .into_response()
            },
            Self::ExpiredSession => {
                warn!("session has expired");
                (
                    StatusCode::UNAUTHORIZED,
                    Json(serde_json::json!({"message": "Session has expired!"})),
                )
                    .into_response()
            },
        }
    }
}

impl From<DomainError> for AppError {
    fn from(value: DomainError) -> Self {
        Self::Domain(value)
    }
}

impl From<infra::DatabaseError> for AppError {
    fn from(value: infra::DatabaseError) -> Self {
        Self::Database(value.to_string())
    }
}

impl From<GatewayError> for AppError {
    fn from(value: GatewayError) -> Self {
        Self::Gateway(value)
    }
}

#[cfg(test)]
mod tests {
    /// Each [`AppError`] variant formats with its documented prefix or message.
    #[test]
    fn display_formats_each_variant_with_expected_message() {
        use super::AppError;
        assert_eq!(
            AppError::Domain(domain::errors::DomainError::CommandRejected(
                "bad".into()
            ))
            .to_string(),
            "Domain error: Command rejected: bad"
        );
        assert_eq!(
            AppError::Database("conn failed".into()).to_string(),
            "Database error: conn failed"
        );
        assert_eq!(
            AppError::Gateway(gateway::errors::GatewayError::Api("500".into()))
                .to_string(),
            "Gateway error: API returned an error: 500"
        );
        assert_eq!(
            AppError::NotImplemented("not ready".into()).to_string(),
            "Requested resource is not supported: not ready"
        );
        assert_eq!(
            AppError::ExpiredSession.to_string(),
            "One or more sessions is expired!"
        );
    }

    /// Domain errors convert into the domain app-error variant.
    #[test]
    fn from_domain_error_wraps_as_domain_variant() {
        use super::AppError;
        let domain_err = domain::errors::DomainError::CommandRejected("test".into());
        let app_err: AppError = domain_err.into();
        assert!(matches!(app_err, AppError::Domain(_)));
    }

    /// Database errors convert into the database app-error variant.
    #[test]
    fn from_database_error_wraps_as_database_variant() {
        use super::AppError;
        let db_err = infra::DatabaseError::Custom("oops".into());
        let app_err: AppError = db_err.into();
        assert!(matches!(app_err, AppError::Database(_)));
    }

    /// Gateway errors convert into the gateway app-error variant.
    #[test]
    fn from_gateway_error_wraps_as_gateway_variant() {
        use super::AppError;
        let gw_err = gateway::errors::GatewayError::Request("timeout".into());
        let app_err: AppError = gw_err.into();
        assert!(matches!(app_err, AppError::Gateway(_)));
    }
}
