//! Budgets handlers.

use axum::{
    Json,
    extract::{
        Path,
        State,
    },
    http::StatusCode,
};
use domain::{
    aggregates::CoreAggregate,
    commands::Command,
    events::budgets::BudgetType,
};
use infra::{
    append_event_to_db,
    get_all_events,
    projections::{
        BudgetProjectionTrait,
        monthly_budgets,
        weekly_budgets,
    },
};
use serde::Deserialize;
use std::sync::Arc;
use tracing::{
    info,
    instrument,
};

use crate::{
    AppState,
    errors::AppError,
};

/// Payload for POST /budgets (CreateBudget).
#[derive(Debug, Deserialize)]
pub struct CreateBudgetPayload {
    /// Start date of the budget in `YYYY-MM-DD` format.
    pub start_date: String,
    /// Whether this is a weekly or monthly budget.
    pub budget_type: BudgetType,
    /// Total budget amount (positive).
    pub amount: f64,
    /// Per-transaction threshold below which spending counts.
    pub threshold: f64,
}

/// Payload for PATCH /budgets/{budget_type} (UpdateBudget).
#[derive(Debug, Deserialize)]
pub struct UpdateBudgetPayload {
    /// New start date in `YYYY-MM-DD` format.
    pub start_date: String,
    /// New budget amount (positive).
    pub amount: f64,
    /// New per-transaction threshold.
    pub threshold: f64,
}

/// Combined response for GET /budgets returning both weekly and monthly data.
#[derive(Debug, serde::Serialize)]
pub struct BudgetsResponse {
    /// Weekly budget rows (budget row + tracked transactions).
    pub weekly: Vec<weekly_budgets::Model>,
    /// Monthly budget rows (budget row + tracked transactions).
    pub monthly: Vec<monthly_budgets::Model>,
}

/// Handler for POST /budgets — create a new budget.
///
/// # Errors
///
/// Returns [`AppError`] in the following scenarios:
/// - The `budget_type` in the payload fails serde deserialization.
/// - The `start_date` is not in `YYYY-MM-DD` format.
/// - The aggregate rejects the command (e.g. a budget of that type already exists).
/// - The event cannot be appended to the store.
#[instrument(
    skip(state, payload),
    fields(
        start_date = %payload.start_date,
        budget_type = %payload.budget_type,
        amount = payload.amount,
        threshold = payload.threshold,
    )
)]
pub async fn create_budget_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateBudgetPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let command = Command::create_budget(
        &payload.start_date,
        payload.budget_type,
        payload.amount,
        payload.threshold,
    )?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone()).await?;
    info!(
        event_id = %res.last_insert_id,
        budget_type = %payload.budget_type,
        "budget created"
    );

    Ok((StatusCode::CREATED, "Budget created!".to_string()))
}

/// Handler for PATCH /budgets/{budget_type} — update an existing budget.
///
/// # Errors
///
/// Returns [`AppError`] in the following scenarios:
/// - The `budget_type` path parameter is not `"weekly"` or `"monthly"`.
/// - The `start_date` is not in `YYYY-MM-DD` format.
/// - The aggregate rejects the command (e.g. no active budget of that type).
/// - The event cannot be appended to the store.
#[instrument(
    skip(state, payload),
    fields(
        budget_type = %budget_type,
        start_date = %payload.start_date,
        amount = payload.amount,
        threshold = payload.threshold,
    )
)]
pub async fn update_budget_handler(
    State(state): State<Arc<AppState>>,
    Path(budget_type): Path<BudgetType>,
    Json(payload): Json<UpdateBudgetPayload>,
) -> axum::response::Result<StatusCode, AppError> {
    let command = Command::create_update_budget(
        &payload.start_date,
        budget_type,
        payload.amount,
        payload.threshold,
    )?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone()).await?;
    info!(
        event_id = %res.last_insert_id,
        %budget_type,
        "budget updated"
    );

    Ok(StatusCode::NO_CONTENT)
}

/// Handler for DELETE /budgets/{budget_type} — delete an existing budget.
///
/// # Errors
///
/// Returns [`AppError`] in the following scenarios:
/// - The `budget_type` path parameter is not `"weekly"` or `"monthly"`.
/// - The aggregate rejects the command (e.g. no active budget of that type).
/// - The event cannot be appended to the store.
#[instrument(skip(state), fields(budget_type = %budget_type))]
pub async fn delete_budget_handler(
    State(state): State<Arc<AppState>>,
    Path(budget_type): Path<BudgetType>,
) -> axum::response::Result<StatusCode, AppError> {
    let command = Command::create_delete_budget(budget_type)?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone()).await?;
    info!(
        event_id = %res.last_insert_id,
        %budget_type,
        "budget deleted"
    );

    Ok(StatusCode::NO_CONTENT)
}

/// Handler for POST /budgets/{budget_type}/reset — reset budget tracking.
///
/// Resets the tracked transactions while keeping the budget row active.
///
/// # Errors
///
/// Returns [`AppError`] in the following scenarios:
/// - The `budget_type` path parameter is not `"weekly"` or `"monthly"`.
/// - The aggregate rejects the command (e.g. no active budget of that type).
/// - The event cannot be appended to the store.
#[instrument(skip(state), fields(budget_type = %budget_type))]
pub async fn reset_budget_handler(
    State(state): State<Arc<AppState>>,
    Path(budget_type): Path<BudgetType>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let command = Command::create_reset_budget(budget_type)?;

    let all_events = get_all_events(&state.db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(&state.db, event.clone()).await?;
    info!(
        event_id = %res.last_insert_id,
        %budget_type,
        "budget reset"
    );

    Ok((StatusCode::ACCEPTED, "Budget reset!".to_string()))
}

/// Handler for GET /budgets — return both weekly and monthly budget data.
///
/// Queries the `weekly_budgets` and `monthly_budgets` projection tables
/// directly and returns their current contents.
///
/// # Errors
///
/// Returns [`AppError`] if either projection query fails.
#[instrument(skip(state))]
pub async fn get_budgets_handler(
    State(state): State<Arc<AppState>>,
) -> axum::response::Result<Json<BudgetsResponse>, AppError> {
    let weekly = weekly_budgets::Entity::get_all(&state.db)
        .await
        .map_err(AppError::from)?;
    let monthly = monthly_budgets::Entity::get_all(&state.db)
        .await
        .map_err(AppError::from)?;

    Ok(Json(BudgetsResponse { weekly, monthly }))
}

/// Handler for GET /budgets/{budget_type} — return budget data for one type.
///
/// # Errors
///
/// Returns [`AppError`] if the `budget_type` is invalid or the query fails.
#[instrument(skip(state), fields(budget_type = %budget_type))]
pub async fn get_one_budget_handler(
    State(state): State<Arc<AppState>>,
    Path(budget_type): Path<BudgetType>,
) -> axum::response::Result<Json<serde_json::Value>, AppError> {
    let result = match budget_type {
        BudgetType::Weekly => {
            let rows = weekly_budgets::Entity::get_all(&state.db)
                .await
                .map_err(AppError::from)?;
            serde_json::to_value(rows)
        },
        BudgetType::Monthly => {
            let rows = monthly_budgets::Entity::get_all(&state.db)
                .await
                .map_err(AppError::from)?;
            serde_json::to_value(rows)
        },
    };

    result
        .map(Json)
        .map_err(|err| AppError::Database(err.to_string()))
}

#[cfg(test)]
mod tests {
    use axum::{
        Json,
        extract::{
            Path,
            State,
        },
        http::StatusCode,
    };
    use sea_orm::Database;
    use std::sync::Arc;

    use super::{
        CreateBudgetPayload,
        UpdateBudgetPayload,
        create_budget_handler,
        delete_budget_handler,
        get_budgets_handler,
        get_one_budget_handler,
        reset_budget_handler,
        update_budget_handler,
    };
    use crate::AppState;
    use domain::events::budgets::BudgetType;

    /// Build an empty in-memory app state with schema synced.
    async fn in_memory_state() -> Arc<AppState> {
        let db = Database::connect("sqlite::memory:").await.unwrap();
        infra::sync_database_schema(&db).await.unwrap();
        Arc::new(AppState { db })
    }

    // ------------------------------------------------------------------
    // POST /budgets
    // ------------------------------------------------------------------

    /// Creating a weekly budget with a valid payload returns 201.
    #[tokio::test]
    async fn create_budget_handler_succeeds_with_valid_weekly_payload() {
        let state = in_memory_state().await;
        let (status, body) = create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-01-15".into(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 50.0,
            }),
        )
        .await
        .unwrap();
        assert_eq!(status, StatusCode::CREATED);
        assert!(body.contains("created"));

        // Verify the event was appended.
        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0], domain::events::Event::BudgetCreated(_)));
    }

    /// Creating a monthly budget with a valid payload returns 201.
    #[tokio::test]
    async fn create_budget_handler_succeeds_with_valid_monthly_payload() {
        let state = in_memory_state().await;
        let (status, _body) = create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-06-01".into(),
                budget_type: BudgetType::Monthly,
                amount: 300.0,
                threshold: 25.0,
            }),
        )
        .await
        .unwrap();
        assert_eq!(status, StatusCode::CREATED);

        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0], domain::events::Event::BudgetCreated(_)));
    }

    /// Creating a budget when one of the same type already exists is rejected.
    #[tokio::test]
    async fn create_budget_handler_rejects_duplicate_budget_type() {
        let state = in_memory_state().await;

        // Create the first weekly budget.
        create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-01-15".into(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 50.0,
            }),
        )
        .await
        .unwrap();

        // Creating a second weekly budget must be rejected by the aggregate.
        let result = create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-02-01".into(),
                budget_type: BudgetType::Weekly,
                amount: 200.0,
                threshold: 20.0,
            }),
        )
        .await;
        assert!(result.is_err());

        // Only the first event remains.
        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 1);
    }

    /// An invalid start date is rejected with a parsing error.
    #[tokio::test]
    async fn create_budget_handler_rejects_invalid_start_date() {
        let state = in_memory_state().await;
        let result = create_budget_handler(
            State(state),
            Json(CreateBudgetPayload {
                start_date: "not-a-date".into(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 50.0,
            }),
        )
        .await;
        assert!(result.is_err());
    }

    /// An unrecognized budget_type in the payload is rejected by serde deserialization.
    #[tokio::test]
    async fn create_budget_handler_rejects_unknown_budget_type() {
        // Serde shall reject "yearly" when deserializing BudgetType.
        let json = serde_json::json!({
            "start_date": "2026-01-01",
            "budget_type": "yearly",
            "amount": 100.0,
            "threshold": 10.0
        });
        let result = serde_json::from_value::<CreateBudgetPayload>(json);
        assert!(result.is_err());
    }

    // ------------------------------------------------------------------
    // PATCH /budgets/{budget_type}
    // ------------------------------------------------------------------

    /// Updating an existing budget with a valid payload returns 204.
    #[tokio::test]
    async fn update_budget_handler_succeeds_for_existing_budget() {
        let state = in_memory_state().await;

        // Create a weekly budget first.
        create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-01-15".into(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 50.0,
            }),
        )
        .await
        .unwrap();

        // Update it.
        let status = update_budget_handler(
            State(state.clone()),
            Path(BudgetType::Weekly),
            Json(UpdateBudgetPayload {
                start_date: "2026-02-01".into(),
                amount: 600.0,
                threshold: 60.0,
            }),
        )
        .await
        .unwrap();
        assert_eq!(status, StatusCode::NO_CONTENT);

        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], domain::events::Event::BudgetUpdated(_)));
    }

    /// Updating a budget type that does not exist is rejected.
    #[tokio::test]
    async fn update_budget_handler_rejects_missing_budget() {
        let state = in_memory_state().await;
        let result = update_budget_handler(
            State(state),
            Path(BudgetType::Monthly),
            Json(UpdateBudgetPayload {
                start_date: "2026-01-01".into(),
                amount: 300.0,
                threshold: 30.0,
            }),
        )
        .await;
        assert!(result.is_err());
    }

    /// An invalid start date is rejected on update.
    #[tokio::test]
    async fn update_budget_handler_rejects_invalid_start_date() {
        let state = in_memory_state().await;

        create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-01-15".into(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 50.0,
            }),
        )
        .await
        .unwrap();

        let result = update_budget_handler(
            State(state),
            Path(BudgetType::Weekly),
            Json(UpdateBudgetPayload {
                start_date: "not-a-date".into(),
                amount: 600.0,
                threshold: 60.0,
            }),
        )
        .await;
        assert!(result.is_err());
    }

    /// An unrecognized budget_type in the path is rejected by axum/serde.
    #[tokio::test]
    async fn update_budget_handler_rejects_unknown_budget_type_in_path() {
        // Axum path deserialization rejects unknown variants; verify at the
        // serde level that "yearly" is not a valid BudgetType.
        let result = serde_json::from_str::<BudgetType>("\"yearly\"");
        assert!(result.is_err());
    }

    // ------------------------------------------------------------------
    // DELETE /budgets/{budget_type}
    // ------------------------------------------------------------------

    /// Deleting an existing budget returns 204.
    #[tokio::test]
    async fn delete_budget_handler_succeeds_for_existing_budget() {
        let state = in_memory_state().await;

        create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-06-01".into(),
                budget_type: BudgetType::Monthly,
                amount: 300.0,
                threshold: 25.0,
            }),
        )
        .await
        .unwrap();

        let status = delete_budget_handler(State(state.clone()), Path(BudgetType::Monthly))
            .await
            .unwrap();
        assert_eq!(status, StatusCode::NO_CONTENT);

        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], domain::events::Event::BudgetDeleted(_)));
    }

    /// Deleting a budget type that does not exist is rejected.
    #[tokio::test]
    async fn delete_budget_handler_rejects_missing_budget() {
        let state = in_memory_state().await;
        let result = delete_budget_handler(State(state), Path(BudgetType::Weekly)).await;
        assert!(result.is_err());
    }

    /// An unrecognized budget_type in the path is rejected by axum/serde on delete.
    #[tokio::test]
    async fn delete_budget_handler_rejects_unknown_budget_type_in_path() {
        let result = serde_json::from_str::<BudgetType>("\"yearly\"");
        assert!(result.is_err());
    }

    // ------------------------------------------------------------------
    // POST /budgets/{budget_type}/reset
    // ------------------------------------------------------------------

    /// Resetting an existing budget returns 202.
    #[tokio::test]
    async fn reset_budget_handler_succeeds_for_existing_budget() {
        let state = in_memory_state().await;

        create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-01-15".into(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 50.0,
            }),
        )
        .await
        .unwrap();

        let (status, body) = reset_budget_handler(State(state.clone()), Path(BudgetType::Weekly))
            .await
            .unwrap();
        assert_eq!(status, StatusCode::ACCEPTED);
        assert!(body.contains("reset"));

        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], domain::events::Event::BudgetReset(_)));
    }

    /// Resetting a budget that does not exist is rejected.
    #[tokio::test]
    async fn reset_budget_handler_rejects_missing_budget() {
        let state = in_memory_state().await;
        let result = reset_budget_handler(State(state), Path(BudgetType::Monthly)).await;
        assert!(result.is_err());
    }

    /// An unrecognized budget_type in the path is rejected by axum/serde on reset.
    #[tokio::test]
    async fn reset_budget_handler_rejects_unknown_budget_type_in_path() {
        let result = serde_json::from_str::<BudgetType>("\"yearly\"");
        assert!(result.is_err());
    }

    // ------------------------------------------------------------------
    // GET /budgets
    // ------------------------------------------------------------------

    /// GET /budgets returns an empty response when no budgets exist.
    #[tokio::test]
    async fn get_budgets_handler_returns_empty_when_no_budgets_exist() {
        let state = in_memory_state().await;
        let response = get_budgets_handler(State(state)).await.unwrap();
        assert!(response.weekly.is_empty());
        assert!(response.monthly.is_empty());
    }

    /// GET /budgets returns data when budgets exist.
    #[tokio::test]
    async fn get_budgets_handler_returns_data_for_existing_budgets() {
        use infra::projections::{
            monthly_budgets,
            weekly_budgets,
        };
        use sea_orm::ActiveModelTrait;

        let state = in_memory_state().await;

        // Insert a weekly budget row directly into the projection.
        weekly_budgets::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(uuid::Uuid::nil()),
            date: sea_orm::ActiveValue::Set(None),
            amount: sea_orm::ActiveValue::Set(100.0),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            creditor_name: sea_orm::ActiveValue::Set("Weekly budget tracking".into()),
            threshold: sea_orm::ActiveValue::Set(10.0),
            ..Default::default()
        }
        .insert(&state.db)
        .await
        .unwrap();

        // Insert a monthly budget row directly into the projection.
        monthly_budgets::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(uuid::Uuid::nil()),
            date: sea_orm::ActiveValue::Set(None),
            amount: sea_orm::ActiveValue::Set(500.0),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            creditor_name: sea_orm::ActiveValue::Set("Monthly budget tracking".into()),
            threshold: sea_orm::ActiveValue::Set(50.0),
            ..Default::default()
        }
        .insert(&state.db)
        .await
        .unwrap();

        let response = get_budgets_handler(State(state)).await.unwrap();
        assert_eq!(response.weekly.len(), 1);
        assert_eq!(response.monthly.len(), 1);
    }

    // ------------------------------------------------------------------
    // GET /budgets/{budget_type}
    // ------------------------------------------------------------------

    /// GET /budgets/monthly returns an empty array when no monthly budget exists.
    #[tokio::test]
    async fn get_one_budget_handler_returns_empty_for_unknown_budget_type() {
        let state = in_memory_state().await;
        let response = get_one_budget_handler(State(state), Path(BudgetType::Monthly))
            .await
            .unwrap();
        let array = response.as_array().unwrap();
        assert!(array.is_empty());
    }

    /// GET /budgets/weekly returns data after a weekly budget is created.
    #[tokio::test]
    async fn get_one_budget_handler_returns_data_for_existing_budget() {
        use infra::projections::weekly_budgets;
        use sea_orm::ActiveModelTrait;

        let state = in_memory_state().await;

        // Insert a weekly budget row.
        weekly_budgets::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(uuid::Uuid::nil()),
            date: sea_orm::ActiveValue::Set(None),
            amount: sea_orm::ActiveValue::Set(100.0),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            creditor_name: sea_orm::ActiveValue::Set("Weekly budget tracking".into()),
            threshold: sea_orm::ActiveValue::Set(10.0),
            ..Default::default()
        }
        .insert(&state.db)
        .await
        .unwrap();

        let response = get_one_budget_handler(State(state), Path(BudgetType::Weekly))
            .await
            .unwrap();
        let array = response.as_array().unwrap();
        assert_eq!(array.len(), 1);
    }

    /// An unrecognized budget_type in the path is rejected by axum/serde on GET.
    #[tokio::test]
    async fn get_one_budget_handler_rejects_unknown_budget_type() {
        let result = serde_json::from_str::<BudgetType>("\"yearly\"");
        assert!(result.is_err());
    }
}
