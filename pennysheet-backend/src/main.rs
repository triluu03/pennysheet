use std::sync::Arc;

use axum::{
    Router,
    routing::{
        get,
        post,
    },
};
use sea_orm::{
    ConnectionTrait,
    Database,
    DatabaseConnection,
    DbBackend,
    DbErr,
    Statement,
};

use crate::{
    api::handlers::import_transaction_handler,
    domain::event_store,
};

pub mod api;
pub mod domain;
pub mod gateway;

const DATABASE_URL: &str = "postgres://postgres:postgres@localhost";
const DB_NAME: &str = "pennysheet_dev";

pub struct AppState {
    db: DatabaseConnection,
}

#[tokio::main]
async fn main() {
    let db = connect_to_database().await.unwrap();
    db.get_schema_builder()
        .register(event_store::Entity)
        .sync(&db)
        .await
        .unwrap();

    let app = Router::new()
        .route("/", get(|| async { "hello, world!" }))
        .route("/transactions/import", post(import_transaction_handler))
        .with_state(Arc::new(AppState { db }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn connect_to_database() -> Result<DatabaseConnection, DbErr> {
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
            println!("{}", error.to_string())
        },
    }

    let url = format!("{}/{}", DATABASE_URL, DB_NAME);
    Database::connect(&url).await
}
