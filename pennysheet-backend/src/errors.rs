//! Errors handler.

use axum::{
    http::StatusCode,
    response::IntoResponse,
};
use domain::errors::DomainError;
use gateway::errors::GatewayError;
use tracing::{
    error,
    warn,
};

pub enum AppError {
    Domain(DomainError),
    Database(String),
    Gateway(GatewayError),
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
