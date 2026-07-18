//! User settings handlers.

use axum::{
    Json,
    extract::{
        Path,
        State,
    },
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
// TODO: write tests for this handler!
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
// TODO: write tests for this handler!
pub async fn create_user_settings_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserSettingsPayload>,
) -> axum::response::Result<Json<UserSettingsResult>, AppError> {
    create_user_setting(
        &state.db,
        payload.regex_rule,
        payload.category,
        payload.classification,
    )
    .await
    .map(|result| {
        tokio::spawn(apply_user_settings_to_expenses(state.db.clone()));
        Json(result)
    })
    .map_err(AppError::from)
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserSettingsPayload {
    pub priority: Option<i64>,
    pub regex_rule: Option<String>,
    pub category: Option<TransactionCategory>,
    pub classification: Option<TransactionClassification>,
}

/// Handler for PATCH request to /settings/{setting_id}
///
/// # Errors
///
/// Returns [`AppError`] if creating fails.
#[instrument(skip(state))]
// TODO: write tests for this handler!
pub async fn update_user_settings_handler(
    State(state): State<Arc<AppState>>,
    Path(setting_id): Path<i64>,
    Json(payload): Json<UpdateUserSettingsPayload>,
) -> axum::response::Result<StatusCode, AppError> {
    update_user_setting(
        &state.db,
        setting_id,
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

/// Handler for DELETE request to /settings/{setting_id}
///
/// # Errors
///
/// Returns [`AppError`] if creating fails.
#[instrument(skip(state))]
// TODO: write tests for this handler!
pub async fn delete_user_settings_handler(
    State(state): State<Arc<AppState>>,
    Path(setting_id): Path<i64>,
) -> axum::response::Result<StatusCode, AppError> {
    delete_user_setting(&state.db, setting_id)
        .await
        .map(|_| {
            tokio::spawn(apply_user_settings_to_expenses(state.db.clone()));
            StatusCode::NO_CONTENT
        })
        .map_err(AppError::from)
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;
    use axum::{
        Json,
        extract::{
            Path,
            State,
        },
    };
    use domain::events::{
        TransactionCategory,
        TransactionClassification,
    };
    use sea_orm::Database;

    use crate::AppState;
    use super::{
        CreateUserSettingsPayload,
        UpdateUserSettingsPayload,
        create_user_settings_handler,
        delete_user_settings_handler,
        get_user_settings_handler,
        update_user_settings_handler,
    };

    /// Build an empty in-memory app state with schema synced.
    async fn in_memory_state() -> Arc<AppState> {
        let db = Database::connect("sqlite::memory:").await.unwrap();
        infra::sync_database_schema(&db).await.unwrap();
        Arc::new(AppState { db })
    }

    /// Getting settings with no stored rows returns an empty list.
    #[tokio::test]
    async fn get_user_settings_handler_returns_empty_list_when_no_settings() {
        let state = in_memory_state().await;
        let response = get_user_settings_handler(State(state)).await.unwrap();
        assert!(response.is_empty());
    }

    /// Creating a setting with a valid regex returns the new setting.
    #[tokio::test]
    async fn create_user_settings_handler_succeeds_with_valid_payload() {
        let state = in_memory_state().await;
        let payload = CreateUserSettingsPayload {
            regex_rule: "Netflix".to_string(),
            category: TransactionCategory::Leisure,
            classification: TransactionClassification::NiceToHave,
        };
        let response =
            create_user_settings_handler(State(state), Json(payload))
                .await
                .unwrap();
        assert_eq!(response.regex_rule, "Netflix");
        assert_eq!(response.category, TransactionCategory::Leisure);
        assert!(response.setting_id > 0);
    }

    /// Creating a setting with an invalid regex is rejected.
    #[tokio::test]
    async fn create_user_settings_handler_rejects_invalid_regex() {
        let state = in_memory_state().await;
        let payload = CreateUserSettingsPayload {
            regex_rule: "[invalid".to_string(),
            category: TransactionCategory::Excluded,
            classification: TransactionClassification::Excluded,
        };
        let result = create_user_settings_handler(State(state), Json(payload)).await;
        assert!(result.is_err());
    }

    /// Updating an existing setting returns no content.
    #[tokio::test]
    async fn update_user_settings_handler_succeeds_for_existing_setting() {
        let state = in_memory_state().await;
        // Create first.
        let created = create_user_settings_handler(
            State(state.clone()),
            Json(CreateUserSettingsPayload {
                regex_rule: "Spotify".to_string(),
                category: TransactionCategory::Services,
                classification: TransactionClassification::Wasted,
            }),
        )
        .await
        .unwrap();
        // Then update.
        let status = update_user_settings_handler(
            State(state),
            Path(created.setting_id),
            Json(UpdateUserSettingsPayload {
                priority: Some(5),
                regex_rule: None,
                category: None,
                classification: None,
            }),
        )
        .await
        .unwrap();
        assert_eq!(status, axum::http::StatusCode::NO_CONTENT);
    }

    /// Updating a missing setting surfaces a not-found error.
    #[tokio::test]
    async fn update_user_settings_handler_rejects_missing_setting() {
        let state = in_memory_state().await;
        let result = update_user_settings_handler(
            State(state),
            Path(999),
            Json(UpdateUserSettingsPayload {
                priority: None,
                regex_rule: None,
                category: None,
                classification: None,
            }),
        )
        .await;
        assert!(result.is_err());
    }

    /// Updating with an invalid regex is rejected.
    #[tokio::test]
    async fn update_user_settings_handler_rejects_invalid_regex() {
        let state = in_memory_state().await;
        // Create a valid setting first.
        let created = create_user_settings_handler(
            State(state.clone()),
            Json(CreateUserSettingsPayload {
                regex_rule: "Ok".to_string(),
                category: TransactionCategory::Health,
                classification: TransactionClassification::MustHave,
            }),
        )
        .await
        .unwrap();
        // Then patch with an invalid regex.
        let result = update_user_settings_handler(
            State(state),
            Path(created.setting_id),
            Json(UpdateUserSettingsPayload {
                priority: None,
                regex_rule: Some("[invalid".to_string()),
                category: None,
                classification: None,
            }),
        )
        .await;
        assert!(result.is_err());
    }

    /// Deleting an existing setting returns no content.
    #[tokio::test]
    async fn delete_user_settings_handler_succeeds_for_existing_setting() {
        let state = in_memory_state().await;
        let created = create_user_settings_handler(
            State(state.clone()),
            Json(CreateUserSettingsPayload {
                regex_rule: "DeleteMe".to_string(),
                category: TransactionCategory::Excluded,
                classification: TransactionClassification::Excluded,
            }),
        )
        .await
        .unwrap();
        let status =
            delete_user_settings_handler(State(state), Path(created.setting_id))
                .await
                .unwrap();
        assert_eq!(status, axum::http::StatusCode::NO_CONTENT);
    }

    /// Deleting a missing setting surfaces a not-found error.
    #[tokio::test]
    async fn delete_user_settings_handler_rejects_missing_setting() {
        let state = in_memory_state().await;
        let result = delete_user_settings_handler(State(state), Path(999)).await;
        assert!(result.is_err());
    }
}
