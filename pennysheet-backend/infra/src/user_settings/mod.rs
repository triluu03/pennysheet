//! User settings table.

use domain::events::{
    TransactionCategory,
    TransactionClassification,
};
use sea_orm::{
    ActiveValue::Set,
    FromQueryResult,
    InsertResult,
    QueryOrder,
    QuerySelect,
    entity::prelude::*,
};
use serde::Serialize;
use tracing::info;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "user_settings")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    setting_id: i64,
    priority: i64,
    regex_rules: String,
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
    pub priority: i64,
    pub regex_rules: String,
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
            Column::Priority,
            Column::RegexRules,
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
pub async fn create_user_setting<C>(
    db: &C,
    regrex_rules: String,
    category: TransactionCategory,
    classification: TransactionClassification,
) -> Result<InsertResult<ActiveModel>, DbErr>
where
    C: ConnectionTrait,
{
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
        regex_rules: Set(regrex_rules),
        category: Set(category),
        classification: Set(classification),
        ..Default::default()
    };

    let result = Entity::insert(new_setting_row).exec(db).await?;
    info!(
        setting_id = result.last_insert_id,
        "created new user setting"
    );
    Ok(result)
}

/// Update a user's settings.
///
/// # Errors
///
/// Returns [`DbErr`] if the operation fails or the provided setting ID is
/// not found in the database.
pub async fn update_user_setting<C>(
    db: &C,
    setting_id: i64,
    regrex_rules: String,
    category: TransactionCategory,
    classification: TransactionClassification,
) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    match Entity::find_by_id(setting_id).one(db).await? {
        Some(setting) => {
            let mut new_setting: ActiveModel = setting.into();
            new_setting.regex_rules = Set(regrex_rules);
            new_setting.category = Set(category);
            new_setting.classification = Set(classification);
            new_setting.update(db).await?;
            Ok(())
        },
        None => Err(DbErr::RecordNotFound(format!(
            "Setting ID: {setting_id} is not found!"
        ))),
    }
}

/// Change a user's settings' priorities.
///
/// # Errors
///
/// Returns [`DbErr`] if the operation fails or the provided setting ID is
/// not found in the database.
pub async fn update_user_setting_priority<C>(
    db: &C,
    setting_id: i64,
    priority: i64,
) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    match Entity::find_by_id(setting_id).one(db).await? {
        Some(setting) => {
            let mut new_setting: ActiveModel = setting.into();
            new_setting.priority = Set(priority);
            new_setting.update(db).await?;
            Ok(())
        },
        None => Err(DbErr::RecordNotFound(format!(
            "Setting ID: {setting_id} is not found!"
        ))),
    }
}

/// Delete a user's settings.
///
/// # Errors
///
/// Returns [`DbErr`] if the operation fails or the provided setting ID is
/// not found in the database.
pub async fn delete_user_setting<C>(db: &C, setting_id: i64) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    match Entity::find_by_id(setting_id).one(db).await? {
        Some(setting) => {
            setting.delete(db).await?;
            Ok(())
        },
        None => Err(DbErr::RecordNotFound(format!(
            "Setting ID: {setting_id} is not found!"
        ))),
    }
}
