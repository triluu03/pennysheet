//! Import requests status projections.

use sea_orm::{
    ActiveValue::Set,
    entity::prelude::*,
};
use serde::Serialize;

use crate::sessions;

#[derive(Clone, Debug, Copy, Serialize, PartialEq, Eq, DeriveActiveEnum, EnumIter)]
#[serde(rename_all = "UPPERCASE")]
#[sea_orm(
    rs_type = "String",
    db_type = "String(StringLen::None)",
    rename_all = "UPPERCASE"
)]
pub enum ImportRequestStatus {
    Pending,
    Failed,
    Succeeded,
}

#[sea_orm::model]
#[derive(Clone, Debug, Serialize, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "import_requests")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub request_id: Uuid,
    pub session_id: i64,
    pub session_name: String,
    pub status: ImportRequestStatus,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {}

/// Create a new import request into the projection.
///
/// # Errors
///
/// Returns [`DbErr`] if the insertion operation fails.
pub async fn create_new_import_request<C>(
    db: &C,
    request_id: Uuid,
    session_id: i64,
) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    let session_data = sessions::get_session_metadata_by_id(db, session_id).await?;
    ActiveModel {
        request_id: Set(request_id),
        session_id: Set(session_id),
        session_name: Set(session_data.session_name),
        status: Set(ImportRequestStatus::Pending),
        ..ActiveModelTrait::default()
    }
    .insert(db)
    .await
    .map(|_| ())
}

/// Update the status of an import request.
///
/// # Errors
///
/// Returns [`DbErr`] if the update operation fails.
pub async fn update_import_request_status<C>(
    db: &C,
    request_id: Uuid,
    status: ImportRequestStatus,
) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    Entity::update_many()
        .col_expr(Column::Status, Expr::value(status))
        .filter(Column::RequestId.eq(request_id))
        .exec(db)
        .await
        .map(|_| ())
}
