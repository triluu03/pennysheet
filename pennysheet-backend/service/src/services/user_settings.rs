//! User settings services shared by the REST API and the MCP server.

use domain::events::{
    TransactionCategory,
    TransactionClassification,
};
use infra::{
    DatabaseConnection,
    UserSettingsResult,
    create_user_setting,
    delete_user_setting,
    get_user_settings,
    update_user_setting,
};
use infra::projections::{
    self,
    AutoUserSettingTrait,
};
use tracing::{
    info,
    instrument,
};

use crate::errors::Result;

/// List all user settings ordered by priority.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the query fails.
pub async fn list_settings(db: &DatabaseConnection) -> Result<Vec<infra::UserSettingsResult>> {
    Ok(infra::get_user_settings(db).await?)
}

/// Apply the user settings to the whole expenses projection.
///
/// # Panics
///
/// Panic in any of the following scenarios:
/// - Cannot query the user settings from the table.
/// - Applying the user settings fails.
#[instrument(skip(db))]
async fn apply_user_settings_to_projections(db: DatabaseConnection) {
    let user_settings = get_user_settings(&db)
        .await
        .expect("querying user settings from the database should succeed!");

    // TODO: make this go through a transaction.
    info!(
        n_settings = user_settings.len(),
        "re-applying user settings to projections"
    );
    projections::expenses::Entity::apply_user_settings_all(&db, &user_settings)
        .await
        .expect("apply user settings to the expenses projection should succeed");
    projections::weekly_budgets::Entity::apply_user_settings_all(&db, &user_settings)
        .await
        .expect("apply user settings to the weekly budget projection should succeed");
    projections::monthly_budgets::Entity::apply_user_settings_all(&db, &user_settings)
        .await
        .expect("apply user settings to the monthly budget projection should succeed");
}

/// Create a new user setting and re-apply projections.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the insert fails.
pub async fn create_setting(
    db: &DatabaseConnection,
    regex_rule: String,
    category: TransactionCategory,
    classification: TransactionClassification,
) -> Result<UserSettingsResult> {
    let result = create_user_setting(db, regex_rule, category, classification).await?;
    tokio::spawn(apply_user_settings_to_projections(db.clone()));
    Ok(result)
}

/// Update an existing user setting and re-apply projections.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the update fails or the setting is not found.
pub async fn update_setting(
    db: &DatabaseConnection,
    setting_id: i64,
    priority: Option<i64>,
    regex_rule: Option<String>,
    category: Option<TransactionCategory>,
    classification: Option<TransactionClassification>,
) -> Result<()> {
    update_user_setting(db, setting_id, priority, regex_rule, category, classification).await?;
    tokio::spawn(apply_user_settings_to_projections(db.clone()));
    Ok(())
}

/// Delete a user setting and re-apply projections.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the delete fails or the setting is not found.
pub async fn delete_setting(db: &DatabaseConnection, setting_id: i64) -> Result<()> {
    delete_user_setting(db, setting_id).await?;
    tokio::spawn(apply_user_settings_to_projections(db.clone()));
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    use crate::{
        errors::ServiceError,
        utils::in_memory_db,
    };

    /// Listing settings against an empty database returns an empty list.
    #[tokio::test]
    async fn list_settings_returns_empty_for_empty_db() {
        let db = in_memory_db().await;

        let settings = list_settings(&db).await.unwrap();

        assert!(settings.is_empty());
    }

    /// [`create_setting`] succeeds with a valid regex and returns the new setting.
    #[tokio::test]
    async fn create_setting_succeeds_with_valid_regex() {
        let db = in_memory_db().await;

        let result = create_setting(
            &db,
            "Netflix".to_string(),
            TransactionCategory::Leisure,
            TransactionClassification::NiceToHave,
        )
        .await
        .unwrap();

        assert_eq!(result.regex_rule, "Netflix");
        assert_eq!(result.category, TransactionCategory::Leisure);
        assert!(result.setting_id > 0);
    }

    /// [`create_setting`] rejects an invalid regex.
    #[tokio::test]
    async fn create_setting_rejects_invalid_regex() {
        let db = in_memory_db().await;

        let result = create_setting(
            &db,
            "[invalid".to_string(),
            TransactionCategory::Excluded,
            TransactionClassification::Excluded,
        )
        .await;
        assert!(matches!(result, Err(ServiceError::Database(_))));
    }

    /// [`update_setting`] succeeds after a setting is created.
    #[tokio::test]
    async fn update_setting_succeeds_after_create() {
        let db = in_memory_db().await;
        let created = create_setting(
            &db,
            "Spotify".to_string(),
            TransactionCategory::Services,
            TransactionClassification::Wasted,
        )
        .await
        .unwrap();

        update_setting(&db, created.setting_id, Some(5), None, None, None)
            .await
            .unwrap();

        let settings = get_user_settings(&db).await.unwrap();
        assert_eq!(settings.len(), 1);
        assert_eq!(settings[0].priority, 5);
    }

    /// [`update_setting`] rejects a missing setting.
    #[tokio::test]
    async fn update_setting_rejects_missing_setting() {
        let db = in_memory_db().await;

        assert!(matches!(
            update_setting(&db, 999, None, None, None, None).await,
            Err(ServiceError::Database(_))
        ));
    }

    /// [`delete_setting`] succeeds after a setting is created.
    #[tokio::test]
    async fn delete_setting_succeeds_after_create() {
        let db = in_memory_db().await;
        let created = create_setting(
            &db,
            "DeleteMe".to_string(),
            TransactionCategory::Excluded,
            TransactionClassification::Excluded,
        )
        .await
        .unwrap();

        delete_setting(&db, created.setting_id).await.unwrap();

        assert!(get_user_settings(&db).await.unwrap().is_empty());
    }

    /// [`delete_setting`] rejects a missing setting.
    #[tokio::test]
    async fn delete_setting_rejects_missing_setting() {
        let db = in_memory_db().await;

        assert!(matches!(
            delete_setting(&db, 999).await,
            Err(ServiceError::Database(_))
        ));
    }
}
