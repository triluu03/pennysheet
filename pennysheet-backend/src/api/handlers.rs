//! API handlers.

use std::sync::Arc;

use axum::{
    Json,
    extract::State,
    http::StatusCode,
};
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
            transactions::ImportTransactions,
        },
        event_store,
    },
};

#[derive(Deserialize)]
pub struct ImportTransactionPayload {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

pub async fn import_transaction_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ImportTransactionPayload>,
) -> axum::response::Result<(StatusCode, String)> {
    let start_date = payload.start_date.unwrap_or("2026-06-06".to_string());

    let command = Command::ImportTransactions(ImportTransactions::new(
        &start_date,
        payload.end_date.as_deref(),
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
