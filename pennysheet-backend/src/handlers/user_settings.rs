//! User settings handlers.

use axum::{
    Json,
    extract::State,
    http::StatusCode,
};
use domain::events::{
    TransactionCategory,
    TransactionClassification,
};
use infra::{
    UserSettingsResult,
    create_user_setting,
    delete_user_setting,
    get_user_settings,
    update_user_setting,
};
use serde::Deserialize;
use std::sync::Arc;
use tracing::instrument;

use crate::{
    AppState,
    background_jobs::apply_user_settings_to_expenses,
    errors::AppError,
};

/// Handler for GET request to /settings
///
/// # Errors
///
/// Returns [`AppError`] if querying the user settings fails.
#[instrument(skip(state))]
pub async fn get_user_settings_handler(
    State(state): State<Arc<AppState>>,
) -> axum::response::Result<Json<Vec<UserSettingsResult>>, AppError> {
    get_user_settings(&state.db)
        .await
        .map(Json)
        .map_err(AppError::from)
}

#[derive(Debug, Deserialize)]
pub struct CreateUserSettingsPayload {
    pub regex_rule: String,
    pub category: TransactionCategory,
    pub classification: TransactionClassification,
}

/// Handler for POST request to /settings
///
/// # Errors
///
/// Returns [`AppError`] if creating fails.
#[instrument(skip(state))]
pub async fn create_user_settings_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserSettingsPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    create_user_setting(
        &state.db,
        payload.regex_rule,
        payload.category,
        payload.classification,
    )
    .await
    .map(|result| {
        tokio::spawn(apply_user_settings_to_expenses(state.db.clone()));
        (
            StatusCode::CREATED,
            format!("Created user setting with ID: {}", result.last_insert_id),
        )
    })
    .map_err(AppError::from)
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserSettingsPayload {
    pub setting_id: i64,
    pub priority: Option<i64>,
    pub regex_rule: Option<String>,
    pub category: Option<TransactionCategory>,
    pub classification: Option<TransactionClassification>,
}

/// Handler for PATCH request to /settings
///
/// # Errors
///
/// Returns [`AppError`] if creating fails.
#[instrument(skip(state))]
pub async fn update_user_settings_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdateUserSettingsPayload>,
) -> axum::response::Result<StatusCode, AppError> {
    update_user_setting(
        &state.db,
        payload.setting_id,
        payload.priority,
        payload.regex_rule,
        payload.category,
        payload.classification,
    )
    .await
    .map(|_| {
        tokio::spawn(apply_user_settings_to_expenses(state.db.clone()));
        StatusCode::NO_CONTENT
    })
    .map_err(AppError::from)
}

#[derive(Debug, Deserialize)]
pub struct DeleteUserSettingsPayload {
    pub setting_id: i64,
}

/// Handler for DELETE request to /settings
///
/// # Errors
///
/// Returns [`AppError`] if creating fails.
#[instrument(skip(state))]
pub async fn delete_user_settings_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<DeleteUserSettingsPayload>,
) -> axum::response::Result<StatusCode, AppError> {
    delete_user_setting(&state.db, payload.setting_id)
        .await
        .map(|_| {
            tokio::spawn(apply_user_settings_to_expenses(state.db.clone()));
            StatusCode::NO_CONTENT
        })
        .map_err(AppError::from)
}
