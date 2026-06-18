//! Event store.

use domain::events::Event;
use sea_orm::{
    ActiveValue::Set,
    InsertManyResult,
    InsertResult,
    QueryOrder,
    QuerySelect,
    entity::prelude::*,
};
use tracing::{
    debug,
    info,
    instrument,
};

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "events")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub event_id: i64,
    pub event_data: Event,
    #[sea_orm(nullable)]
    pub metadata: Json,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {}

/// Query the whole event table.
///
/// # Errors
///
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_all_events(db: &DatabaseConnection) -> Result<Vec<Event>, DbErr> {
    let events: Vec<Event> = Entity::find()
        .select_only()
        .column(Column::EventData)
        .order_by_asc(Column::EventId)
        .into_tuple()
        .all(db)
        .await?;

    debug!(count = events.len(), "loaded all events");
    Ok(events)
}

/// Query the event table with OFFSET.
///
/// Get all events from the table except some of the first events.
///
/// # Errors
///
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_events_with_offset(
    db: &DatabaseConnection,
    n_offset: i64,
) -> Result<Vec<Event>, DbErr> {
    let events: Vec<Event> = Entity::find()
        .select_only()
        .column(Column::EventData)
        .filter(Column::EventId.gt(n_offset))
        .order_by_asc(Column::EventId)
        .into_tuple()
        .all(db)
        .await?;

    debug!(
        count = events.len(),
        n_offset, "loaded the events with offset"
    );
    Ok(events)
}

/// Append a new event to the database.
///
/// # Errors
///
/// Return [`DbErr`] if the insert operation fails.
#[instrument(skip(db, event))]
pub async fn append_event_to_db(
    db: &DatabaseConnection,
    event: Event,
) -> Result<InsertResult<ActiveModel>, DbErr> {
    let new_event_row = ActiveModel {
        event_data: Set(event),
        ..Default::default()
    };

    let result = Entity::insert(new_event_row).exec(db).await?;
    info!(n_new_events = 1, "appended new events");
    Ok(result)
}

/// Append multiple new events to the database.
///
/// # Errors
///
/// Returns [`DbErr`] if the insert operation fails.
#[instrument(skip(db, events))]
pub async fn append_multi_events_to_db(
    db: &DatabaseConnection,
    events: Vec<Event>,
) -> Result<InsertManyResult<ActiveModel>, DbErr> {
    let new_event_rows = events.into_iter().map(|event| ActiveModel {
        event_data: Set(event),
        ..Default::default()
    });
    let n_new_events = new_event_rows.len();

    let result = Entity::insert_many(new_event_rows).exec(db).await?;
    info!(n_new_events, "appended new events");
    Ok(result)
}
