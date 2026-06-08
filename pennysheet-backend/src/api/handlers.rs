//! API handlers.

use std::sync::Arc;

use axum::{
    Json,
    extract::State,
    http::StatusCode,
};
use chrono::NaiveDate;
use sea_orm::{
    ActiveValue::Set,
    EntityTrait,
};
use serde::Deserialize;

use crate::{
    AppState,
    api::errors::AppError,
    domain::{
        aggregates::CoreAggregate,
        commands::{
            Command,
            transactions::ImportTransactionsData,
        },
        event_store,
    },
};

#[derive(Deserialize)]
pub struct ImportTransactionPayload {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

/// Handler for POST request to /transactions/import
///
/// # Errors
/// Return AppError in the following scenarios:
/// - Failed to parse the payload into expected format.
/// - Command is rejected by the aggregate.
/// - Failed to insert the new event into the store.
pub async fn import_transaction_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ImportTransactionPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let start_date = payload.start_date.unwrap_or("2026-06-06".to_string());
    let parsed_start_date = NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")?;

    let parsed_end_date = payload
        .end_date
        .map(|str| NaiveDate::parse_from_str(&str, "%Y-%m-%d"))
        .transpose()?;

    let command = Command::ImportTransactions(ImportTransactionsData::new(
        parsed_start_date,
        parsed_end_date,
    ));
    let event = CoreAggregate::new().execute(command)?;

    let new_event_row = event_store::ActiveModel {
        event_data: Set(event),
        ..Default::default()
    };

    let res = event_store::Entity::insert(new_event_row)
        .exec(&state.db)
        .await
        .map_err(AppError::from)?;

    Ok((
        StatusCode::CREATED,
        format!("Event created with ID: {}", res.last_insert_id),
    ))
}
