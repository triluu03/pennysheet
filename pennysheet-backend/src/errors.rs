//! Errors handler.

use axum::{
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
                (StatusCode::BAD_REQUEST, format!("{}", error)).into_response()
            },
            Self::Database(message) => {
                error!(%message, "database error while handling request");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Database error: {}", message),
                )
                    .into_response()
            },
            Self::Gateway(error) => {
                error!(%error, "gateway error while handling request");
                (StatusCode::BAD_GATEWAY, format!("{}", error)).into_response()
            },
            Self::NotImplemented(error) => {
                error!(%error, "not implemented error while handling request");
                (
                    StatusCode::BAD_REQUEST,
                    format!("Not implemented error: {}", error),
                )
                    .into_response()
            },
            Self::ExpiredSession => {
                warn!("session has expired");
                (StatusCode::UNAUTHORIZED, "Session has expired!".to_string()).into_response()
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
