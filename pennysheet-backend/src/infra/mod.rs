//! Infrastructure management.

use sea_orm::{
    ActiveValue::Set,
    ConnectionTrait,
    Database,
    DatabaseConnection,
    DbBackend,
    DbErr,
    EntityTrait,
    FromQueryResult,
    InsertResult,
    QueryOrder,
    QuerySelect,
    Statement,
};

use crate::domain::events::Event;

mod event_store;
mod projections;

const DATABASE_URL: &str = "postgres://postgres:postgres@localhost";
const DB_NAME: &str = "pennysheet_dev";

#[derive(FromQueryResult)]
struct EventRow {
    event_data: Event,
}

/// Connect to the database.
///
/// # Errors
/// Return [`DbErr`] if the connecting fails.
pub async fn connect_to_database() -> Result<DatabaseConnection, DbErr> {
    let db: DatabaseConnection = Database::connect(DATABASE_URL).await?;

    match db
        .execute_raw(Statement::from_string(
            DbBackend::Postgres,
            format!("CREATE DATABASE \"{}\";", DB_NAME),
        ))
        .await
    {
        Ok(_) => println!("Created the database 'pennysheet_dev'"),
        Err(error) => {
            println!("{}", error)
        },
    }

    let url = format!("{}/{}", DATABASE_URL, DB_NAME);
    Database::connect(&url).await
}

/// Sync the entities to the database schema.
///
/// # Errors
/// Returns [`DbErr`] if the syncing fails.
pub async fn sync_database_schema(db: &DatabaseConnection) -> Result<(), DbErr> {
    db.get_schema_builder()
        .register(event_store::Entity)
        .sync(db)
        .await
}

/// Query the whole event table.
///
/// # Errors
/// Returns [`DbErr`] if the query operation fails.
pub async fn get_all_events(db: &DatabaseConnection) -> Result<Vec<Event>, DbErr> {
    Ok(event_store::Entity::find()
        .select_only()
        .column(event_store::Column::EventData)
        .order_by_asc(event_store::Column::CreatedAt)
        .into_model::<EventRow>()
        .all(db)
        .await?
        .into_iter()
        .map(|entry| entry.event_data)
        .collect())
}

/// Append a new event to the database.
///
/// # Errors
/// Return [`DbErr`] if the insert operation fails.
pub async fn append_event_to_db(
    db: &DatabaseConnection,
    event: Event,
) -> Result<InsertResult<event_store::ActiveModel>, DbErr> {
    let new_event_row = event_store::ActiveModel {
        event_data: Set(event),
        ..Default::default()
    };

    event_store::Entity::insert(new_event_row).exec(db).await
}
