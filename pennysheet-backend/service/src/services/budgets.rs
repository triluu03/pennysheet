//! Budget services shared by the REST API and the MCP server.

use chrono::NaiveDate;
use domain::{
    aggregates::CoreAggregate,
    commands::Command,
    events::budgets::BudgetType,
    process_managers::budget::BudgetProcessManager,
};
use infra::{
    DatabaseConnection,
    append_event_to_db,
    get_all_events,
    projections::{
        BudgetProjectionTrait,
        monthly_budgets,
        weekly_budgets,
    },
};
use tracing::info;

use crate::{
    errors::Result,
    utils::to_json_value,
};

/// Combined budget data returned by [`list_budgets`].
#[derive(Debug, serde::Serialize)]
pub struct BudgetsResponse {
    /// Weekly budget rows (budget row + tracked transactions).
    pub weekly: Vec<weekly_budgets::Model>,
    /// Monthly budget rows (budget row + tracked transactions).
    pub monthly: Vec<monthly_budgets::Model>,
}

/// List both weekly and monthly budget projections.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if either projection query fails.
pub async fn list_budgets(db: &DatabaseConnection) -> Result<BudgetsResponse> {
    let weekly = weekly_budgets::Entity::get_all(db).await?;
    let monthly = monthly_budgets::Entity::get_all(db).await?;

    Ok(BudgetsResponse { weekly, monthly })
}

/// Get a single budget type's projection rows serialized as JSON.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the projection query fails or
/// [`ServiceError::Serialization`] if the rows cannot be serialized into JSON.
pub async fn get_budget(
    db: &DatabaseConnection,
    budget_type: BudgetType,
) -> Result<serde_json::Value> {
    match budget_type {
        BudgetType::Weekly => {
            let rows = weekly_budgets::Entity::get_all(db).await?;
            to_json_value(rows)
        },
        BudgetType::Monthly => {
            let rows = monthly_budgets::Entity::get_all(db).await?;
            to_json_value(rows)
        },
    }
}

/// Outcome of a budget reset attempt.
#[derive(Debug, PartialEq, Eq)]
pub enum ResetBudgetOutcome {
    /// The current period hasn't started yet; no reset was performed.
    NotStarted,
    /// The budget was reset to the new start date.
    Reset,
}

/// Create a new budget.
///
/// # Errors
///
/// Returns [`ServiceError::Domain`] if the command is rejected by the aggregate, or
/// [`ServiceError::Database`] if loading events or appending the resulting event fails.
pub async fn create_budget(
    db: &DatabaseConnection,
    start_date: NaiveDate,
    budget_type: BudgetType,
    amount: f64,
    threshold: f64,
) -> Result<String> {
    let start = start_date.format("%Y-%m-%d").to_string();
    let command = Command::create_budget(&start, budget_type, amount, threshold)?;
    let all_events = get_all_events(db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;
    let res = append_event_to_db(db, event).await?;
    info!(event_id = %res.last_insert_id, %budget_type, "budget created");
    Ok("Budget created!".to_string())
}

/// Update an existing budget.
///
/// # Errors
///
/// Returns [`ServiceError::Domain`] if the command is rejected by the aggregate, or
/// [`ServiceError::Database`] if loading events or appending the resulting event fails.
pub async fn update_budget(
    db: &DatabaseConnection,
    start_date: NaiveDate,
    budget_type: BudgetType,
    amount: f64,
    threshold: f64,
) -> Result<()> {
    let start = start_date.format("%Y-%m-%d").to_string();
    let command = Command::create_update_budget(&start, budget_type, amount, threshold)?;
    let all_events = get_all_events(db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;
    let res = append_event_to_db(db, event).await?;
    info!(event_id = %res.last_insert_id, %budget_type, "budget updated");
    Ok(())
}

/// Delete an existing budget.
///
/// # Errors
///
/// Returns [`ServiceError::Domain`] if the command is rejected by the aggregate, or
/// [`ServiceError::Database`] if loading events or appending the resulting event fails.
pub async fn delete_budget(db: &DatabaseConnection, budget_type: BudgetType) -> Result<()> {
    let command = Command::create_delete_budget(budget_type)?;
    let all_events = get_all_events(db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;
    let res = append_event_to_db(db, event).await?;
    info!(event_id = %res.last_insert_id, %budget_type, "budget deleted");
    Ok(())
}

/// Reset budget tracking to a new start date.
///
/// # Errors
///
/// Returns [`ServiceError::Domain`] if the process manager cannot be initialized or the
/// command is rejected by the aggregate, or [`ServiceError::Database`] if loading events or
/// appending the resulting event fails.
pub async fn reset_budget(
    db: &DatabaseConnection,
    start_date: NaiveDate,
    budget_type: BudgetType,
) -> Result<ResetBudgetOutcome> {
    let all_events = get_all_events(db).await?;
    let process_manager = BudgetProcessManager::new(&all_events)?;

    if let Some(current_start) = process_manager.start_date(budget_type)
        && current_start >= start_date
    {
        info!(
            %budget_type,
            %current_start,
            %start_date,
            "skipping budget reset: current budget period has not started yet"
        );
        return Ok(ResetBudgetOutcome::NotStarted);
    }

    let previous_remaining = process_manager.remaining_amount(budget_type);
    let command = Command::create_reset_budget(start_date, budget_type, previous_remaining)?;
    let event = CoreAggregate::new(&all_events).execute(command)?;
    let res = append_event_to_db(db, event).await?;
    info!(event_id = %res.last_insert_id, %budget_type, "budget reset");
    Ok(ResetBudgetOutcome::Reset)
}

#[cfg(test)]
mod tests {
    use sea_orm::ActiveModelTrait;

    use super::*;
    use domain::events::Event;

    use crate::{
        errors::ServiceError,
        utils::in_memory_db,
    };

    /// Listing budgets against an empty database returns empty weekly and monthly lists.
    #[tokio::test]
    async fn list_budgets_returns_empty_for_empty_db() {
        let db = in_memory_db().await;

        let response = list_budgets(&db).await.unwrap();

        assert!(response.weekly.is_empty());
        assert!(response.monthly.is_empty());
    }

    /// Getting a monthly budget against an empty database returns an empty JSON array.
    #[tokio::test]
    async fn get_budget_returns_empty_array_for_empty_db() {
        let db = in_memory_db().await;

        let value = get_budget(&db, BudgetType::Monthly).await.unwrap();

        assert_eq!(value, serde_json::json!([]));
    }

    /// Seeded weekly and monthly projection rows are both returned by [`list_budgets`].
    #[tokio::test]
    async fn list_budgets_returns_seeded_rows() {
        let db = in_memory_db().await;

        weekly_budgets::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(uuid::Uuid::nil()),
            date: sea_orm::ActiveValue::Set(None),
            amount: sea_orm::ActiveValue::Set(100.0),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            creditor_name: sea_orm::ActiveValue::Set("Weekly budget tracking".into()),
            threshold: sea_orm::ActiveValue::Set(10.0),
            ..Default::default()
        }
        .insert(&db)
        .await
        .unwrap();

        monthly_budgets::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(uuid::Uuid::nil()),
            date: sea_orm::ActiveValue::Set(None),
            amount: sea_orm::ActiveValue::Set(500.0),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            creditor_name: sea_orm::ActiveValue::Set("Monthly budget tracking".into()),
            threshold: sea_orm::ActiveValue::Set(50.0),
            ..Default::default()
        }
        .insert(&db)
        .await
        .unwrap();

        let response = list_budgets(&db).await.unwrap();

        assert_eq!(response.weekly.len(), 1);
        assert_eq!(response.monthly.len(), 1);
    }

    /// [`get_budget`] returns only rows for the requested budget type.
    #[tokio::test]
    async fn get_budget_returns_seeded_rows_for_requested_type() {
        let db = in_memory_db().await;

        weekly_budgets::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(uuid::Uuid::nil()),
            date: sea_orm::ActiveValue::Set(None),
            amount: sea_orm::ActiveValue::Set(100.0),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            creditor_name: sea_orm::ActiveValue::Set("Weekly budget tracking".into()),
            threshold: sea_orm::ActiveValue::Set(10.0),
            ..Default::default()
        }
        .insert(&db)
        .await
        .unwrap();

        let weekly = get_budget(&db, BudgetType::Weekly).await.unwrap();
        assert_eq!(weekly.as_array().unwrap().len(), 1);

        let monthly = get_budget(&db, BudgetType::Monthly).await.unwrap();
        assert_eq!(monthly, serde_json::json!([]));
    }

    /// [`create_budget`] succeeds and appends a `BudgetCreated` event.
    #[tokio::test]
    async fn create_budget_succeeds_and_appends_event() {
        let db = in_memory_db().await;

        let msg = create_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
            BudgetType::Weekly,
            500.0,
            50.0,
        )
        .await
        .unwrap();
        assert_eq!(msg, "Budget created!");

        let events = get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0], Event::BudgetCreated(_)));
    }

    /// [`update_budget`] succeeds after a budget exists and appends a `BudgetUpdated` event.
    #[tokio::test]
    async fn update_budget_succeeds_after_create() {
        let db = in_memory_db().await;
        create_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
            BudgetType::Weekly,
            500.0,
            50.0,
        )
        .await
        .unwrap();

        update_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 2, 1).unwrap(),
            BudgetType::Weekly,
            600.0,
            60.0,
        )
        .await
        .unwrap();

        let events = get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], Event::BudgetUpdated(_)));
    }

    /// [`delete_budget`] succeeds after a budget exists and appends a `BudgetDeleted` event.
    #[tokio::test]
    async fn delete_budget_succeeds_after_create() {
        let db = in_memory_db().await;
        create_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
            BudgetType::Weekly,
            500.0,
            50.0,
        )
        .await
        .unwrap();

        delete_budget(&db, BudgetType::Weekly).await.unwrap();

        let events = get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], Event::BudgetDeleted(_)));
    }

    /// [`delete_budget`] rejects a missing budget without appending events.
    #[tokio::test]
    async fn delete_budget_rejects_missing_budget() {
        let db = in_memory_db().await;

        assert!(matches!(
            delete_budget(&db, BudgetType::Weekly).await,
            Err(ServiceError::Domain(_))
        ));
        assert!(get_all_events(&db).await.unwrap().is_empty());
    }

    /// [`reset_budget`] succeeds after a budget exists and appends a `BudgetReset` event.
    #[tokio::test]
    async fn reset_budget_succeeds_after_create() {
        let db = in_memory_db().await;
        create_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
            BudgetType::Weekly,
            500.0,
            50.0,
        )
        .await
        .unwrap();

        let outcome = reset_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 2, 1).unwrap(),
            BudgetType::Weekly,
        )
        .await
        .unwrap();
        assert_eq!(outcome, ResetBudgetOutcome::Reset);

        let events = get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], Event::BudgetReset(_)));
    }

    /// [`reset_budget`] skips when the current start is not before the new start and
    /// appends nothing.
    #[tokio::test]
    async fn reset_budget_skips_when_current_period_not_started() {
        let db = in_memory_db().await;
        create_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 2, 1).unwrap(),
            BudgetType::Weekly,
            500.0,
            50.0,
        )
        .await
        .unwrap();

        // Equal start date.
        let outcome = reset_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 2, 1).unwrap(),
            BudgetType::Weekly,
        )
        .await
        .unwrap();
        assert_eq!(outcome, ResetBudgetOutcome::NotStarted);

        // Earlier start date.
        let outcome = reset_budget(
            &db,
            NaiveDate::from_ymd_opt(2026, 1, 1).unwrap(),
            BudgetType::Weekly,
        )
        .await
        .unwrap();
        assert_eq!(outcome, ResetBudgetOutcome::NotStarted);

        let events = get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0], Event::BudgetCreated(_)));
    }

    /// [`reset_budget`] rejects a missing budget.
    #[tokio::test]
    async fn reset_budget_rejects_missing_budget() {
        let db = in_memory_db().await;

        assert!(matches!(
            reset_budget(
                &db,
                NaiveDate::from_ymd_opt(2026, 1, 1).unwrap(),
                BudgetType::Weekly,
            )
            .await,
            Err(ServiceError::Domain(_))
        ));
    }
}
