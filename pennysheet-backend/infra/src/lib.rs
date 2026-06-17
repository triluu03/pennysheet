//! Infrastructure management.

use domain::events::Event;
use sea_orm::{
    ActiveValue::Set,
    ConnectionTrait,
    Database,
    DbBackend,
    DbErr,
    EntityName,
    EntityTrait,
    FromQueryResult,
    InsertManyResult,
    InsertResult,
    QueryOrder,
    QuerySelect,
    Statement,
};
pub use sea_orm::{
    DatabaseConnection,
    DbErr as DatabaseError,
};
use tracing::{
    debug,
    info,
    instrument,
};

mod event_store;
mod projections;

/// Environment variable holding the base PostgreSQL connection URL (without the database name).
const DATABASE_URL_ENV: &str = "DATABASE_URL";
/// Environment variable holding the name of the application database.
const DB_NAME_ENV: &str = "DB_NAME";

#[derive(FromQueryResult)]
struct EventRow {
    event_data: Event,
}

/// Connect to the database.
///
/// The connection URL and database name are read from the [`DATABASE_URL_ENV`] and [`DB_NAME_ENV`]
/// environment variables. The database will be created if it did not exist.
///
/// # Errors
/// Return [`DbErr`] if the required environment variables are missing or the
/// connecting fails.
pub async fn connect_to_database() -> Result<DatabaseConnection, DbErr> {
    dotenvy::dotenv().ok();
    let database_url = std::env::var(DATABASE_URL_ENV).map_err(|error| {
        DbErr::Custom(format!(
            "failed to read the `{DATABASE_URL_ENV}` environment variable ({error}); set \
             `{DATABASE_URL_ENV}` in the .env file or the process environment"
        ))
    })?;
    let db_name = std::env::var(DB_NAME_ENV).map_err(|error| {
        DbErr::Custom(format!(
            "failed to read the `{DB_NAME_ENV}` environment variable ({error}); set \
             `{DB_NAME_ENV}` in the .env file or the process environment"
        ))
    })?;

    let db: DatabaseConnection = Database::connect(&database_url).await?;
    match db
        .execute_raw(Statement::from_string(
            DbBackend::Postgres,
            format!("CREATE DATABASE \"{db_name}\";"),
        ))
        .await
    {
        Ok(_) => info!(%db_name, "created database"),
        Err(error) => debug!(%error, "create database skipped (likely already exists)"),
    }

    let url = format!("{database_url}/{db_name}");
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

/// Ensure that event store is append-only.
///
/// This sets the trigger in the event store table in PostgreSQL to prevent all UPDATE, DELETE, and
/// TRUNCATE commands from being executed.
///
/// # Errors
/// Return [`DbErr`] if executing the queries fails.
pub async fn ensure_append_only_eventstore(db: &DatabaseConnection) -> Result<(), DbErr> {
    // Setup function for raising exceptions.
    db.execute_raw(Statement::from_string(
        DbBackend::Postgres,
        "CREATE OR REPLACE FUNCTION public.event_store_exception()
            RETURNS trigger
            LANGUAGE plpgsql
        AS $function$
        DECLARE
            message text;
        BEGIN
            message := 'EventStore: ' || TG_ARGV[0];
            RAISE EXCEPTION USING MESSAGE = message, ERRCODE = 'feature_not_supported';
        END;
        $function$",
    ))
    .await?;

    // Set the triggers in the event store table.
    db.execute_raw(Statement::from_string(
        DbBackend::Postgres,
        format!(
            "CREATE OR REPLACE TRIGGER no_delete_events
            BEFORE UPDATE OR DELETE OR TRUNCATE ON {}
            FOR EACH STATEMENT EXECUTE FUNCTION
            event_store_exception('Cannot delete or update events')",
            event_store::Entity.table_name()
        ),
    ))
    .await?;

    Ok(())
}

/// Query the whole event table.
///
/// # Errors
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_all_events(db: &DatabaseConnection) -> Result<Vec<Event>, DbErr> {
    let events: Vec<Event> = event_store::Entity::find()
        .select_only()
        .column(event_store::Column::EventData)
        .order_by_asc(event_store::Column::CreatedAt)
        .into_model::<EventRow>()
        .all(db)
        .await?
        .into_iter()
        .map(|entry| entry.event_data)
        .collect();

    debug!(count = events.len(), "loaded all events");
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
) -> Result<InsertResult<event_store::ActiveModel>, DbErr> {
    let new_event_row = event_store::ActiveModel {
        event_data: Set(event),
        ..Default::default()
    };

    let result = event_store::Entity::insert(new_event_row).exec(db).await?;
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
) -> Result<InsertManyResult<event_store::ActiveModel>, DbErr> {
    let new_event_rows = events.into_iter().map(|event| event_store::ActiveModel {
        event_data: Set(event),
        ..Default::default()
    });

    let result = event_store::Entity::insert_many(new_event_rows)
        .exec(db)
        .await?;
    debug!("appended multiple events");
    Ok(result)
}
