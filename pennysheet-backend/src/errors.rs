//! Errors handler.

use axum::{
    http::StatusCode,
    response::IntoResponse,
};
use domain::errors::DomainError;

pub enum AppError {
    Domain(DomainError),
    Database(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::Domain(error) => (StatusCode::BAD_REQUEST, format!("{}", error)).into_response(),
            Self::Database(message) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Database error: {}", message),
            )
                .into_response(),
        }
    }
}

impl From<DomainError> for AppError {
    fn from(value: DomainError) -> Self {
        Self::Domain(value)
    }
}

impl From<sea_orm::DbErr> for AppError {
    fn from(value: sea_orm::DbErr) -> Self {
        Self::Database(value.to_string())
    }
}
