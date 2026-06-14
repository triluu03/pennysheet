//! Event store.

use sea_orm::{
    ActiveValue::Set,
    entity::prelude::*,
};

use domain::events::Event;

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "events")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub event_id: Uuid,
    pub event_data: Event,
    #[sea_orm(nullable)]
    pub metadata: Json,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        Self {
            event_id: Set(uuid::Uuid::new_v4()),
            ..ActiveModelTrait::default()
        }
    }
}
