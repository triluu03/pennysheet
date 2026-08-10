//! Budgets handlers.

use axum::{
    Json,
    extract::{
        Path,
        State,
    },
    http::StatusCode,
};
use chrono::NaiveDate;
use domain::{
    aggregates::CoreAggregate,
    commands::Command,
    events::budgets::BudgetType,
    process_managers::budget::BudgetProcessManager,
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

/// Payload for POST /budgets/{budget_type}/reset (ResetBudget).
#[derive(Debug, Deserialize)]
pub struct ResetBudgetPayload {
    /// New start date in `YYYY-MM-DD` format to advance the budget to.
    pub start_date: String,
}

/// Handler for POST /budgets/{budget_type}/reset — reset budget tracking.
///
/// Resets the tracked transactions and advances the budget's start date to the
/// provided value while keeping the amount and threshold unchanged.
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
    )
)]
pub async fn reset_budget_handler(
    State(state): State<Arc<AppState>>,
    Path(budget_type): Path<BudgetType>,
    Json(payload): Json<ResetBudgetPayload>,
) -> axum::response::Result<(StatusCode, String), AppError> {
    let new_start = NaiveDate::parse_from_str(&payload.start_date, "%Y-%m-%d")
        .map_err(|e| AppError::Domain(e.into()))?;

    let all_events = get_all_events(&state.db).await?;
    let process_manager = BudgetProcessManager::new(&all_events)?;

    // Skip if the current budget period hasn't started yet.
    if let Some(current_start) = process_manager.start_date(budget_type)
        && current_start >= new_start
    {
        info!(
            %budget_type,
            %current_start,
            %new_start,
            "skipping budget reset: current budget period has not started yet"
        );
        return Ok((
            StatusCode::OK,
            "Budget period has not started yet".to_string(),
        ));
    }

    let previous_remaining = process_manager.remaining_amount(budget_type);

    let command = Command::create_reset_budget(new_start, budget_type, previous_remaining)?;

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
        ResetBudgetPayload,
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

    /// Resetting an existing budget returns 202 and appends a BudgetReset event.
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

        let (status, body) = reset_budget_handler(
            State(state.clone()),
            Path(BudgetType::Weekly),
            Json(ResetBudgetPayload {
                start_date: "2026-02-01".into(),
            }),
        )
        .await
        .unwrap();
        assert_eq!(status, StatusCode::ACCEPTED);
        assert!(body.contains("reset"));

        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], domain::events::Event::BudgetReset(_)));
    }

    /// Resetting a monthly budget with a new start date emits the correct event.
    #[tokio::test]
    async fn reset_budget_handler_succeeds_for_monthly_budget() {
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

        let (status, _body) = reset_budget_handler(
            State(state.clone()),
            Path(BudgetType::Monthly),
            Json(ResetBudgetPayload {
                start_date: "2026-07-01".into(),
            }),
        )
        .await
        .unwrap();
        assert_eq!(status, StatusCode::ACCEPTED);

        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], domain::events::Event::BudgetReset(_)));
    }

    /// Resetting a budget that does not exist is rejected.
    #[tokio::test]
    async fn reset_budget_handler_rejects_missing_budget() {
        let state = in_memory_state().await;
        let result = reset_budget_handler(
            State(state),
            Path(BudgetType::Monthly),
            Json(ResetBudgetPayload {
                start_date: "2026-01-01".into(),
            }),
        )
        .await;
        assert!(result.is_err());
    }

    /// An invalid start date is rejected on reset.
    #[tokio::test]
    async fn reset_budget_handler_rejects_invalid_start_date() {
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

        let result = reset_budget_handler(
            State(state),
            Path(BudgetType::Weekly),
            Json(ResetBudgetPayload {
                start_date: "not-a-date".into(),
            }),
        )
        .await;
        assert!(result.is_err());
    }

    /// An unrecognized budget_type in the path is rejected by axum/serde on reset.
    #[tokio::test]
    async fn reset_budget_handler_rejects_unknown_budget_type_in_path() {
        let result = serde_json::from_str::<BudgetType>("\"yearly\"");
        assert!(result.is_err());
    }

    /// When transactions have been spent against the budget, resetting rolls
    /// the remaining amount into the next period by computing previous_remaining
    /// from the BudgetProcessManager and passing it to the reset command.
    #[tokio::test]
    async fn reset_budget_handler_rolls_over_remaining_from_transactions() {
        use domain::events::{
            Event,
            budgets::TrackedExpenseData,
            transactions::TransactionData,
        };
        use gateway::schema::enable_banking_api::{
            AmountType,
            transaction::{
                PartyIdentification,
                Transaction,
            },
        };

        let state = in_memory_state().await;

        // Create a weekly budget of 500.
        create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-01-15".into(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 500.0,
            }),
        )
        .await
        .unwrap();

        // Record a 300 transaction, leaving 200 remaining.
        let transaction = Transaction {
            transaction_amount: AmountType {
                currency: "EUR".to_string(),
                amount: "300.00".to_string(),
            },
            creditor: Some(PartyIdentification {
                name: Some("Test Store".to_string()),
            }),
            debtor: None,
            booking_date: Some("2026-01-20".to_string()),
            transaction_date: Some("2026-01-20".to_string()),
            entry_reference: None,
        };
        let recorded =
            TransactionData::new(transaction, "test-account-uid").expect("valid transaction");
        let tracked = TrackedExpenseData::from_transaction(&recorded, BudgetType::Weekly)
            .expect("fixture transaction has a creditor");
        infra::append_event_to_db(&state.db, Event::BudgetExpenseTracked(tracked))
            .await
            .unwrap();

        // Reset the budget — the handler should compute previous_remaining=200.
        let (status, _body) = reset_budget_handler(
            State(state.clone()),
            Path(BudgetType::Weekly),
            Json(ResetBudgetPayload {
                start_date: "2026-02-01".into(),
            }),
        )
        .await
        .unwrap();
        assert_eq!(status, StatusCode::ACCEPTED);

        // Verify the BudgetReset event carries the rolled-over remaining amount.
        let events = infra::get_all_events(&state.db).await.unwrap();
        assert_eq!(events.len(), 3); // BudgetCreated, BudgetExpenseTracked, BudgetReset
        match &events[2] {
            Event::BudgetReset(data) => {
                assert!((data.previous_remaining - 200.0).abs() < f64::EPSILON);
            },
            other => panic!("expected BudgetReset, got {other:?}"),
        }
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

    /// Budget reset rollover through the handler consumes tracked-expense events.
    #[tokio::test]
    async fn reset_budget_handler_rolls_over_tracked_expense_remaining() {
        use domain::events::{
            Event,
            budgets::TrackedExpenseData,
            transactions::TransactionData,
        };
        use gateway::schema::enable_banking_api::{
            AmountType,
            transaction::{
                PartyIdentification,
                Transaction,
            },
        };

        let state = in_memory_state().await;
        create_budget_handler(
            State(state.clone()),
            Json(CreateBudgetPayload {
                start_date: "2026-01-15".into(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 500.0,
            }),
        )
        .await
        .unwrap();

        let transaction = Transaction {
            transaction_amount: AmountType {
                currency: "EUR".to_string(),
                amount: "300.00".to_string(),
            },
            creditor: Some(PartyIdentification {
                name: Some("Test Store".to_string()),
            }),
            debtor: None,
            booking_date: Some("2026-01-20".to_string()),
            transaction_date: Some("2026-01-20".to_string()),
            entry_reference: None,
        };
        let recorded =
            TransactionData::new(transaction, "test-account-uid").expect("valid transaction");
        let tracked = TrackedExpenseData::from_transaction(&recorded, BudgetType::Weekly)
            .expect("fixture transaction has a creditor");
        infra::append_event_to_db(&state.db, Event::BudgetExpenseTracked(tracked))
            .await
            .unwrap();

        let (status, _) = reset_budget_handler(
            State(state.clone()),
            Path(BudgetType::Weekly),
            Json(ResetBudgetPayload {
                start_date: "2026-02-01".into(),
            }),
        )
        .await
        .unwrap();
        assert_eq!(status, StatusCode::ACCEPTED);

        let events = infra::get_all_events(&state.db).await.unwrap();
        match &events[2] {
            Event::BudgetReset(data) => assert_eq!(data.previous_remaining, 200.0),
            other => panic!("expected BudgetReset, got {other:?}"),
        }
    }

    // ------------------------------------------------------------------
    // BudgetProjectionTrait::reset_budget (direct trait method tests)
    // ------------------------------------------------------------------

    /// After reset with positive remaining, the budget amount is preserved and a
    /// separate carryover row captures the unused budget.
    #[tokio::test]
    async fn reset_budget_preserves_amount_with_positive_carryover() {
        use infra::projections::{
            BudgetProjectionTrait,
            weekly_budgets,
        };

        let state = in_memory_state().await;

        // Seed a weekly budget.
        weekly_budgets::Entity::start_tracking_new_budget(
            &state.db,
            &domain::events::budgets::BudgetData {
                start_date: chrono::NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 500.0,
            },
        )
        .await
        .unwrap();

        // Reset: roll over 200 remaining to the next period.
        let new_date = chrono::NaiveDate::from_ymd_opt(2026, 2, 1).unwrap();
        weekly_budgets::Entity::reset_budget(&state.db, new_date, 200.0)
            .await
            .unwrap();

        let all = weekly_budgets::Entity::get_all(&state.db).await.unwrap();
        // Expect 2 rows: budget + carryover.
        assert_eq!(all.len(), 2, "should have budget row and one carryover row");

        let budget_row = all
            .iter()
            .find(|r| r.transaction_id.is_nil())
            .expect("budget row with nil transaction_id");
        assert_eq!(
            budget_row.amount, 500.0,
            "budget amount should be unchanged"
        );
        assert_eq!(
            budget_row.date,
            Some(new_date),
            "budget date should be updated"
        );

        let carryover = all
            .iter()
            .find(|r| !r.transaction_id.is_nil())
            .expect("carryover row with non-nil transaction_id");
        assert_eq!(
            carryover.amount, 200.0,
            "carryover should capture the unused amount"
        );
        assert_eq!(carryover.date, Some(new_date));
        assert_eq!(carryover.creditor_name, "Weekly budget carryover");
    }

    /// After reset with negative remaining (overspending), the carryover row
    /// holds a negative amount while the budget amount stays unchanged.
    #[tokio::test]
    async fn reset_budget_handles_negative_overspending() {
        use infra::projections::{
            BudgetProjectionTrait,
            weekly_budgets,
        };

        let state = in_memory_state().await;

        weekly_budgets::Entity::start_tracking_new_budget(
            &state.db,
            &domain::events::budgets::BudgetData {
                start_date: chrono::NaiveDate::from_ymd_opt(2026, 3, 1).unwrap(),
                budget_type: BudgetType::Weekly,
                amount: 400.0,
                threshold: 400.0,
            },
        )
        .await
        .unwrap();

        let new_date = chrono::NaiveDate::from_ymd_opt(2026, 4, 1).unwrap();
        // Overspent by 150.
        weekly_budgets::Entity::reset_budget(&state.db, new_date, -150.0)
            .await
            .unwrap();

        let all = weekly_budgets::Entity::get_all(&state.db).await.unwrap();
        assert_eq!(all.len(), 2);

        let budget_row = all.iter().find(|r| r.transaction_id.is_nil()).unwrap();
        assert_eq!(
            budget_row.amount, 400.0,
            "budget amount should be unchanged"
        );

        let carryover = all.iter().find(|r| !r.transaction_id.is_nil()).unwrap();
        assert_eq!(
            carryover.amount, -150.0,
            "carryover should capture the overspent amount"
        );
    }

    /// The carryover row always has a non-nil transaction_id, distinct from
    /// the budget row which always has a nil transaction_id.
    #[tokio::test]
    async fn reset_budget_carryover_has_non_nil_transaction_id() {
        use infra::projections::{
            BudgetProjectionTrait,
            weekly_budgets,
        };

        let state = in_memory_state().await;

        weekly_budgets::Entity::start_tracking_new_budget(
            &state.db,
            &domain::events::budgets::BudgetData {
                start_date: chrono::NaiveDate::from_ymd_opt(2026, 5, 1).unwrap(),
                budget_type: BudgetType::Weekly,
                amount: 300.0,
                threshold: 300.0,
            },
        )
        .await
        .unwrap();

        let new_date = chrono::NaiveDate::from_ymd_opt(2026, 6, 1).unwrap();
        weekly_budgets::Entity::reset_budget(&state.db, new_date, 50.0)
            .await
            .unwrap();

        let all = weekly_budgets::Entity::get_all(&state.db).await.unwrap();

        let nil_ids: Vec<_> = all.iter().filter(|r| r.transaction_id.is_nil()).collect();
        let non_nil_ids: Vec<_> = all.iter().filter(|r| !r.transaction_id.is_nil()).collect();

        assert_eq!(
            nil_ids.len(),
            1,
            "exactly one row should have nil transaction_id"
        );
        assert_eq!(
            non_nil_ids.len(),
            1,
            "exactly one row should have non-nil transaction_id"
        );
        assert_eq!(nil_ids[0].creditor_name, "Weekly budget tracking");
        assert_eq!(non_nil_ids[0].creditor_name, "Weekly budget carryover");
    }

    /// Both the budget row and carryover row have their date set to the new start date.
    #[tokio::test]
    async fn reset_budget_updates_dates_on_both_rows() {
        use infra::projections::{
            BudgetProjectionTrait,
            weekly_budgets,
        };

        let state = in_memory_state().await;

        weekly_budgets::Entity::start_tracking_new_budget(
            &state.db,
            &domain::events::budgets::BudgetData {
                start_date: chrono::NaiveDate::from_ymd_opt(2026, 7, 10).unwrap(),
                budget_type: BudgetType::Weekly,
                amount: 250.0,
                threshold: 250.0,
            },
        )
        .await
        .unwrap();

        let new_date = chrono::NaiveDate::from_ymd_opt(2026, 8, 1).unwrap();
        weekly_budgets::Entity::reset_budget(&state.db, new_date, 75.0)
            .await
            .unwrap();

        let all = weekly_budgets::Entity::get_all(&state.db).await.unwrap();
        for row in &all {
            assert_eq!(
                row.date,
                Some(new_date),
                "every row after reset should have the new start date"
            );
        }
    }

    /// Old transaction rows are deleted during reset; only the budget row
    /// and the new carryover row remain.
    #[tokio::test]
    async fn reset_budget_removes_old_transaction_rows() {
        use infra::projections::{
            BudgetProjectionTrait,
            weekly_budgets,
        };
        use sea_orm::ActiveModelTrait;

        let state = in_memory_state().await;

        // Seed a budget and insert two old transaction rows.
        weekly_budgets::Entity::start_tracking_new_budget(
            &state.db,
            &domain::events::budgets::BudgetData {
                start_date: chrono::NaiveDate::from_ymd_opt(2026, 9, 1).unwrap(),
                budget_type: BudgetType::Weekly,
                amount: 600.0,
                threshold: 600.0,
            },
        )
        .await
        .unwrap();

        // Insert two old tracked-expense rows.
        for (id, amt) in [
            (uuid::Uuid::new_v4(), -100.0),
            (uuid::Uuid::new_v4(), -200.0),
        ] {
            weekly_budgets::ActiveModel {
                transaction_id: sea_orm::ActiveValue::Set(id),
                date: sea_orm::ActiveValue::Set(Some(
                    chrono::NaiveDate::from_ymd_opt(2026, 9, 15).unwrap(),
                )),
                amount: sea_orm::ActiveValue::Set(amt),
                currency: sea_orm::ActiveValue::Set("EUR".into()),
                creditor_name: sea_orm::ActiveValue::Set("Test Store".into()),
                threshold: sea_orm::ActiveValue::Set(0.0),
                ..Default::default()
            }
            .insert(&state.db)
            .await
            .unwrap();
        }

        // Before reset we have 1 budget row + 2 transaction rows.
        let before = weekly_budgets::Entity::get_all(&state.db).await.unwrap();
        assert_eq!(before.len(), 3);

        let new_date = chrono::NaiveDate::from_ymd_opt(2026, 10, 1).unwrap();
        weekly_budgets::Entity::reset_budget(&state.db, new_date, 300.0)
            .await
            .unwrap();

        // After reset: budget row + carryover row = 2 rows.
        let after = weekly_budgets::Entity::get_all(&state.db).await.unwrap();
        assert_eq!(after.len(), 2, "old transaction rows should be removed");

        // The old transaction IDs should not appear.
        let has_budget = after.iter().any(|r| r.transaction_id.is_nil());
        let carryover = after
            .iter()
            .find(|r| !r.transaction_id.is_nil() && r.creditor_name == "Weekly budget carryover");
        assert!(has_budget);
        assert!(carryover.is_some());
        assert!(
            (carryover.unwrap().amount - 300.0).abs() < f64::EPSILON,
            "carryover amount must equal the passed previous_remaining"
        );
    }

    /// Monthly budgets also work with the carryover mechanism.
    #[tokio::test]
    async fn reset_budget_monthly_preserves_amount_with_carryover() {
        use infra::projections::{
            BudgetProjectionTrait,
            monthly_budgets,
        };

        let state = in_memory_state().await;

        monthly_budgets::Entity::start_tracking_new_budget(
            &state.db,
            &domain::events::budgets::BudgetData {
                start_date: chrono::NaiveDate::from_ymd_opt(2026, 1, 1).unwrap(),
                budget_type: BudgetType::Monthly,
                amount: 1000.0,
                threshold: 500.0,
            },
        )
        .await
        .unwrap();

        let new_date = chrono::NaiveDate::from_ymd_opt(2026, 2, 1).unwrap();
        monthly_budgets::Entity::reset_budget(&state.db, new_date, 350.0)
            .await
            .unwrap();

        let all = monthly_budgets::Entity::get_all(&state.db).await.unwrap();
        assert_eq!(all.len(), 2);

        let budget_row = all.iter().find(|r| r.transaction_id.is_nil()).unwrap();
        assert_eq!(budget_row.amount, 1000.0);
        assert_eq!(budget_row.date, Some(new_date));

        let carryover = all.iter().find(|r| !r.transaction_id.is_nil()).unwrap();
        assert_eq!(carryover.amount, 350.0);
        assert_eq!(carryover.creditor_name, "Monthly budget carryover");
    }
}
