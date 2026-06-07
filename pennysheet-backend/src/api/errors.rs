//! Errors handler.

use axum::{
    http::StatusCode,
    response::IntoResponse,
};

pub enum AppError {
    CommandRejected(String),
    DatabaseError(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::CommandRejected(message) => (
                StatusCode::BAD_REQUEST,
                format!("Command has been rejected! Reason: {}", message),
            )
                .into_response(),
            Self::DatabaseError(message) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Database error: {}", message),
            )
                .into_response(),
        }
    }
}

impl From<sea_orm::DbErr> for AppError {
    fn from(value: sea_orm::DbErr) -> Self {
        Self::DatabaseError(value.to_string())
    }
}
