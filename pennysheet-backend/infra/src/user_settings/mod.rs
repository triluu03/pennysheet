//! User settings table.

use domain::events::{
    TransactionCategory,
    TransactionClassification,
};
use sea_orm::{
    ActiveValue::Set,
    FromQueryResult,
    QueryOrder,
    QuerySelect,
    entity::prelude::*,
};
use serde::Serialize;
use std::str::FromStr;
use tracing::{
    info,
    instrument,
};

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "user_settings")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    setting_id: i64,
    priority: i64,
    regex_rule: String,
    category: TransactionCategory,
    classification: TransactionClassification,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    created_at: DateTime,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    updated_at: DateTime,
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(mut self, _db: &C, _insert: bool) -> Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        self.updated_at = Set(chrono::Local::now().naive_local());
        Ok(self)
    }
}

/// Aggregated SELECT results.
#[derive(Debug, Clone, Serialize, FromQueryResult)]
pub struct UserSettingsResult {
    pub setting_id: i64,
    pub priority: i64,
    pub regex_rule: String,
    pub category: TransactionCategory,
    pub classification: TransactionClassification,
}

/// Get all of the current user's settings.
///
/// # Errors
///
/// Returns [`DbErr`] if the operation fails.
pub async fn get_user_settings<C>(db: &C) -> Result<Vec<UserSettingsResult>, DbErr>
where
    C: ConnectionTrait,
{
    Entity::find()
        .select_only()
        .columns([
            Column::SettingId,
            Column::Priority,
            Column::RegexRule,
            Column::Category,
            Column::Classification,
        ])
        .order_by_asc(Column::Priority)
        .into_model()
        .all(db)
        .await
}

/// Create a new user's settings.
///
/// # Errors
///
/// Returns [`DbErr`] if the operation fails.
#[instrument(skip(db, regex_rule))]
pub async fn create_user_setting<C>(
    db: &C,
    regex_rule: String,
    category: TransactionCategory,
    classification: TransactionClassification,
) -> Result<UserSettingsResult, DbErr>
where
    C: ConnectionTrait,
{
    if regex::Regex::from_str(&regex_rule).is_err() {
        return Err(DbErr::Custom(format!(
            "Regex rule: {regex_rule} is not valid!"
        )));
    }

    let lowest_priority: i64 = Entity::find()
        .select_only()
        .column(Column::Priority)
        .into_tuple::<Option<i64>>()
        .one(db)
        .await?
        .flatten()
        .unwrap_or(0);

    let new_setting_row = ActiveModel {
        priority: Set(lowest_priority + 1),
        regex_rule: Set(regex_rule),
        category: Set(category),
        classification: Set(classification),
        ..Default::default()
    };

    let result: Model = new_setting_row.insert(db).await?;

    info!(setting_id = result.setting_id, "created new user setting");
    Ok(UserSettingsResult {
        setting_id: result.setting_id,
        priority: result.priority,
        regex_rule: result.regex_rule,
        category: result.category,
        classification: result.classification,
    })
}

/// Update a user's settings.
///
/// # Errors
///
/// Returns [`DbErr`] if the operation fails or the provided setting ID is
/// not found in the database.
#[instrument(skip(db, regex_rule))]
pub async fn update_user_setting<C>(
    db: &C,
    setting_id: i64,
    priority: Option<i64>,
    regex_rule: Option<String>,
    category: Option<TransactionCategory>,
    classification: Option<TransactionClassification>,
) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    if regex_rule
        .as_ref()
        .is_some_and(|rule| regex::Regex::from_str(rule).is_err())
    {
        return Err(DbErr::Custom(
            "Provided regex rule is not valid!".to_string(),
        ));
    }

    let Some(setting) = Entity::find_by_id(setting_id).one(db).await? else {
        return Err(DbErr::RecordNotFound(format!(
            "Setting ID: {setting_id} is not found!"
        )));
    };

    let mut new_setting: ActiveModel = setting.into();

    if let Some(rule) = regex_rule {
        new_setting.regex_rule = Set(rule);
    }
    if let Some(category) = category {
        new_setting.category = Set(category);
    }
    if let Some(classification) = classification {
        new_setting.classification = Set(classification);
    }
    if let Some(priority) = priority {
        new_setting.priority = Set(priority);
    }

    new_setting.update(db).await?;
    info!("updated user setting");
    Ok(())
}

/// Delete a user's settings.
///
/// # Errors
///
/// Returns [`DbErr`] if the operation fails or the provided setting ID is
/// not found in the database.
#[instrument(skip(db))]
pub async fn delete_user_setting<C>(db: &C, setting_id: i64) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    match Entity::find_by_id(setting_id).one(db).await? {
        Some(setting) => {
            setting.delete(db).await?;
            info!("deleted user setting");
            Ok(())
        },
        None => Err(DbErr::RecordNotFound(format!(
            "Setting ID: {setting_id} is not found!"
        ))),
    }
}
