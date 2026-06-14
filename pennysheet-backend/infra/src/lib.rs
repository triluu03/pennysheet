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
    InsertResult,
    QueryOrder,
    QuerySelect,
    Statement,
};
pub use sea_orm::{
    DatabaseConnection,
    DbErr as DatabaseError,
};

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
            event_store_exception('Cannot delete or update events')
            ",
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
