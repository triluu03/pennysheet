//! Errors handler.

use axum::{
    http::StatusCode,
    response::IntoResponse,
};
use chrono::ParseError;

use crate::domain::errors::DomainError;

pub enum AppError {
    DomainError(DomainError),
    DatabaseError(String),
    PayloadError(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::DomainError(error) => {
                (StatusCode::BAD_REQUEST, format!("{}", error)).into_response()
            },
            Self::DatabaseError(message) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Database error: {}", message),
            )
                .into_response(),
            Self::PayloadError(message) => (
                StatusCode::BAD_REQUEST,
                format!("Payload is not accepted: {}", message),
            )
                .into_response(),
        }
    }
}

impl From<DomainError> for AppError {
    fn from(value: DomainError) -> Self {
        Self::DomainError(value)
    }
}

impl From<sea_orm::DbErr> for AppError {
    fn from(value: sea_orm::DbErr) -> Self {
        Self::DatabaseError(value.to_string())
    }
}

impl From<ParseError> for AppError {
    fn from(value: ParseError) -> Self {
        Self::PayloadError(value.to_string())
    }
}
