//! Event store.

use domain::events::Event;
use sea_orm::{
    ActiveValue::Set,
    FromQueryResult,
    InsertManyResult,
    InsertResult,
    QueryOrder,
    QuerySelect,
    entity::prelude::*,
};
use tracing::{
    debug,
    instrument,
};

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
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

#[derive(FromQueryResult)]
struct EventRow {
    event_data: Event,
}

/// Query the whole event table.
///
/// # Errors
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_all_events(db: &DatabaseConnection) -> Result<Vec<Event>, DbErr> {
    let events: Vec<Event> = Entity::find()
        .select_only()
        .column(Column::EventData)
        .order_by_asc(Column::CreatedAt)
        .into_model::<EventRow>()
        .all(db)
        .await?
        .into_iter()
        .map(|entry| entry.event_data)
        .collect();

    debug!(count = events.len(), "loaded all events");
    Ok(events)
}

/// Query the event table with OFFSET.
///
/// Get all events from the table except some of the first events.
///
/// # Errors
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_events_with_offset(
    db: &DatabaseConnection,
    n_offset: u64,
) -> Result<Vec<Event>, DbErr> {
    let events: Vec<Event> = Entity::find()
        .select_only()
        .column(Column::EventData)
        .order_by_asc(Column::CreatedAt)
        .offset(n_offset)
        .into_model::<EventRow>()
        .all(db)
        .await?
        .into_iter()
        .map(|entry| entry.event_data)
        .collect();

    debug!(
        count = events.len(),
        n_offset, "loaded the events with offset"
    );
    Ok(events)
}

/// Append a new event to the database.
///
/// # Errors
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
    debug!(inserted_id = %result.last_insert_id, "appended event");
    Ok(result)
}

/// Append multiple new events to the database.
///
/// # Errors
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

    let result = Entity::insert_many(new_event_rows).exec(db).await?;
    debug!("appended multiple events");
    Ok(result)
}
