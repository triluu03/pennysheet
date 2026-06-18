//! Sessions stored in the database.

use gateway::schema::enable_banking_session::EnableBankingSession;
use sea_orm::{
    ActiveValue::Set,
    DeriveEntityModel,
    InsertResult,
    QuerySelect,
    entity::prelude::*,
};
use tracing::instrument;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "sessions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub session_id: i64,
    pub enable_banking_session: EnableBankingSession,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {}

/// Get the current Enable Banking session.
///
/// # Errors
///
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_current_session(
    db: &DatabaseConnection,
) -> Result<Option<EnableBankingSession>, DbErr> {
    Entity::find()
        .select_only()
        .column(Column::EnableBankingSession)
        .order_by_id_desc()
        .into_tuple()
        .one(db)
        .await
}

/// Insert new session to the table.
///
/// # Errors
///
/// Returns [`DbErr`] if the insertion fails.
#[instrument(skip(db))]
pub async fn insert_new_session(
    db: &DatabaseConnection,
    session: EnableBankingSession,
) -> Result<InsertResult<ActiveModel>, DbErr> {
    let new_session = ActiveModel {
        enable_banking_session: Set(session),
        ..Default::default()
    };

    Entity::insert(new_session).exec(db).await
}
