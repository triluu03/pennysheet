//! Read-only budget services shared by the REST API and the MCP server.

use domain::events::budgets::BudgetType;
use infra::{
    DatabaseConnection,
    projections::{
        BudgetProjectionTrait,
        monthly_budgets,
        weekly_budgets,
    },
};

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

#[cfg(test)]
mod tests {
    use sea_orm::ActiveModelTrait;

    use super::*;

    use crate::utils::in_memory_db;

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
}
