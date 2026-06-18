//! Projector states.

use sea_orm::{
    ActiveValue::Set,
    QuerySelect,
    entity::prelude::*,
};
use tracing::instrument;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "projector_states")]
pub(crate) struct Model {
    #[sea_orm(primary_key)]
    projector_name: String,
    last_seen_event_number: i64,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    inserted_at: DateTime,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    updated_at: DateTime,
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        Self {
            ..ActiveModelTrait::default()
        }
    }

    async fn before_save<C>(mut self, _db: &C, _insert: bool) -> Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        self.updated_at = Set(chrono::Local::now().naive_local());
        Ok(self)
    }
}

/// Get the state of a projector.
///
/// Return the last seen event number.
///
/// # Errors
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub(crate) async fn get_projector_state(
    db: &DatabaseConnection,
    projector_name: &str,
) -> Result<Option<i64>, DbErr> {
    Entity::find_by_id(projector_name)
        .select_only()
        .column(Column::LastSeenEventNumber)
        .into_tuple()
        .one(db)
        .await
}

/// Update the state of a projector.
///
/// # Errors
/// Returns [`DbErr`] if the update operation fails.
#[instrument(skip(db))]
pub(crate) async fn update_projector_state<C>(
    db: &C,
    projector_name: &str,
    last_seen_event_number: i64,
) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    match Entity::find_by_id(projector_name).one(db).await? {
        None => {
            let new_state = ActiveModel {
                projector_name: Set(projector_name.to_string()),
                last_seen_event_number: Set(last_seen_event_number),
                ..Default::default()
            };
            Entity::insert(new_state).exec(db).await?;
            Ok(())
        },
        Some(current_state) => {
            let mut new_state: ActiveModel = current_state.into();
            new_state.last_seen_event_number = Set(last_seen_event_number);
            new_state.update(db).await?;
            Ok(())
        },
    }
}
