//! Transaction services shared by the REST API and the MCP server.

use std::str::FromStr;

use chrono::NaiveDate;
use domain::{
    aggregates::CoreAggregate,
    commands::Command,
    errors::DomainError,
    events::{
        TransactionCategory,
        TransactionCategoryData,
        TransactionClassification,
        TransactionClassificationData,
        TransactionNoteData,
    },
};
use infra::{
    DatabaseConnection,
    projections::{
        TimeAggregation,
        TransactionProjectionTrait,
    },
};
#[cfg(feature = "mcp-support")]
use schemars::JsonSchema;
use serde::{
    Deserialize,
    Serialize,
};
use strum::IntoEnumIterator;
use tracing::info;
use uuid::Uuid;

use crate::{
    errors::{
        Result,
        ServiceError,
    },
    utils::to_json_value,
};

/// The kind of transaction to query for.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
#[cfg_attr(feature = "mcp-support", derive(JsonSchema))]
pub enum TransactionKind {
    /// Income transactions.
    Income,
    /// Expense transactions.
    Expenses,
}

impl FromStr for TransactionKind {
    type Err = DomainError;

    fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "income" => Ok(Self::Income),
            "expenses" => Ok(Self::Expenses),
            _ => Err(DomainError::Parsing(format!(
                "invalid transaction kind `{s}`; expected one of: income, expenses"
            ))),
        }
    }
}

/// List transactions matching the given filters.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the query fails or [`ServiceError::Serialization`] if
/// the result cannot be serialized into JSON.
pub async fn list_transactions(
    db: &DatabaseConnection,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
    kind: Option<TransactionKind>,
    categories: Vec<TransactionCategory>,
    classifications: Vec<TransactionClassification>,
) -> Result<serde_json::Value> {
    match kind {
        Some(TransactionKind::Income) => {
            let data = infra::projections::income::Entity::get_transactions(
                db,
                start_date,
                end_date,
                None,
                categories,
                classifications,
            )
            .await?;
            to_json_value(data)
        },
        Some(TransactionKind::Expenses) => {
            let data = infra::projections::expenses::Entity::get_transactions(
                db,
                start_date,
                end_date,
                None,
                categories,
                classifications,
            )
            .await?;
            to_json_value(data)
        },
        None => {
            let data = infra::projections::transactions::Entity::get_transactions(
                db,
                start_date,
                end_date,
                None,
                categories,
                classifications,
            )
            .await?;
            to_json_value(data)
        },
    }
}

/// Get a single transaction by its ID across all categories and classifications.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the query fails.
pub async fn get_transaction(
    db: &DatabaseConnection,
    transaction_id: Uuid,
) -> Result<Vec<infra::projections::transactions::Model>> {
    infra::projections::transactions::Entity::get_transactions(
        db,
        None,
        None,
        Some(transaction_id),
        TransactionCategory::iter().collect(),
        TransactionClassification::iter().collect(),
    )
    .await
    .map_err(ServiceError::from)
}

/// List transactions time-aggregated at the given level.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the query fails or [`ServiceError::Serialization`] if
/// the result cannot be serialized into JSON.
pub async fn aggregate_transactions(
    db: &DatabaseConnection,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
    aggregated_level: TimeAggregation,
    kind: Option<TransactionKind>,
    categories: Vec<TransactionCategory>,
    classifications: Vec<TransactionClassification>,
) -> Result<serde_json::Value> {
    match kind {
        Some(TransactionKind::Income) => {
            let data = infra::projections::income::Entity::get_transactions_time_aggregated(
                db,
                start_date,
                end_date,
                aggregated_level,
                categories,
                classifications,
            )
            .await?;
            to_json_value(data)
        },
        Some(TransactionKind::Expenses) => {
            let data = infra::projections::expenses::Entity::get_transactions_time_aggregated(
                db,
                start_date,
                end_date,
                aggregated_level,
                categories,
                classifications,
            )
            .await?;
            to_json_value(data)
        },
        None => {
            let data = infra::projections::transactions::Entity::get_transactions_time_aggregated(
                db,
                start_date,
                end_date,
                aggregated_level,
                categories,
                classifications,
            )
            .await?;
            to_json_value(data)
        },
    }
}

/// Build the expenses pivot table for the given filters.
///
/// # Errors
///
/// Returns [`ServiceError::Database`] if the query fails or [`ServiceError::Serialization`] if
/// the result cannot be serialized into JSON.
pub async fn pivot_expenses(
    db: &DatabaseConnection,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
    categories: Vec<TransactionCategory>,
    classifications: Vec<TransactionClassification>,
) -> Result<serde_json::Value> {
    let data = infra::projections::expenses::get_expenses_pivot_table(
        db,
        start_date,
        end_date,
        categories,
        classifications,
    )
    .await?;
    to_json_value(data)
}

/// Assign a category to a transaction.
///
/// # Errors
///
/// Returns [`ServiceError::Domain`] if the command is rejected by the aggregate, or
/// [`ServiceError::Database`] if loading events or appending the resulting event fails.
pub async fn categorize_transaction(
    db: &DatabaseConnection,
    transaction_id: Uuid,
    category: TransactionCategory,
) -> Result<String> {
    let command = Command::CategorizeTransaction(TransactionCategoryData {
        transaction_id,
        category,
    });
    let all_events = infra::get_all_events(db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;
    let res = infra::append_event_to_db(db, event).await?;
    info!(event_id = %res.last_insert_id, "transaction categorized");
    Ok("Transaction categorized!".to_string())
}

/// Assign a classification to a transaction.
///
/// # Errors
///
/// Returns [`ServiceError::Domain`] if the command is rejected by the aggregate, or
/// [`ServiceError::Database`] if loading events or appending the resulting event fails.
pub async fn classify_transaction(
    db: &DatabaseConnection,
    transaction_id: Uuid,
    classification: TransactionClassification,
) -> Result<String> {
    let command = Command::ClassifyTransaction(TransactionClassificationData {
        transaction_id,
        classification,
    });
    let all_events = infra::get_all_events(db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;
    let res = infra::append_event_to_db(db, event).await?;
    info!(event_id = %res.last_insert_id, "transaction classified");
    Ok("Transaction classified!".to_string())
}

/// Update the note of a transaction.
///
/// # Errors
///
/// Returns [`ServiceError::Domain`] if the command is rejected by the aggregate, or
/// [`ServiceError::Database`] if loading events or appending the resulting event fails.
pub async fn update_transaction_note(
    db: &DatabaseConnection,
    transaction_id: Uuid,
    note: String,
) -> Result<String> {
    let command = Command::UpdateTransactionNote(TransactionNoteData {
        transaction_id,
        note,
    });
    let all_events = infra::get_all_events(db).await?;
    let event = CoreAggregate::new(&all_events).execute(command)?;
    let res = infra::append_event_to_db(db, event).await?;
    info!(event_id = %res.last_insert_id, "transaction note updated");
    Ok("Transaction note updated!".to_string())
}

#[cfg(test)]
mod tests {
    use sea_orm::ActiveModelTrait;

    use super::*;
    use domain::events::Event;

    use crate::utils::in_memory_db;

    /// Listing transactions against an empty database returns an empty JSON array.
    #[tokio::test]
    async fn list_transactions_returns_empty_array_for_empty_db() {
        let db = in_memory_db().await;

        let value = list_transactions(&db, None, None, None, vec![], vec![])
            .await
            .unwrap();

        assert_eq!(value, serde_json::json!([]));
    }

    /// Looking up an unknown transaction ID returns an empty list.
    #[tokio::test]
    async fn get_transaction_returns_empty_for_unknown_id() {
        let db = in_memory_db().await;

        let transactions = get_transaction(&db, Uuid::new_v4()).await.unwrap();

        assert!(transactions.is_empty());
    }

    /// Seeded transaction projection rows are returned by [`list_transactions`].
    #[tokio::test]
    async fn list_transactions_returns_seeded_rows() {
        let db = in_memory_db().await;

        infra::projections::transactions::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(Uuid::new_v4()),
            amount: sea_orm::ActiveValue::Set(12.5),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            ..Default::default()
        }
        .insert(&db)
        .await
        .unwrap();

        let value = list_transactions(&db, None, None, None, vec![], vec![])
            .await
            .unwrap();

        let rows = value.as_array().unwrap();
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0]["amount"], 12.5);
    }

    /// [`TransactionKind::from_str`] accepts known values case-insensitively.
    #[test]
    fn transaction_kind_from_str_accepts_known_values() {
        assert_eq!(
            "income".parse::<TransactionKind>().unwrap(),
            TransactionKind::Income
        );
        assert_eq!(
            "Expenses".parse::<TransactionKind>().unwrap(),
            TransactionKind::Expenses
        );
    }

    /// Unknown transaction kinds surface a parsing error rather than panicking.
    #[test]
    fn transaction_kind_from_str_rejects_unknown_value() {
        let result = "not-a-kind".parse::<TransactionKind>();
        assert!(matches!(result, Err(DomainError::Parsing(_))));
    }

    /// Listing with an income kind returns only rows from the income projection.
    ///
    /// The expenses branch (and the aggregated/pivot queries) cannot be exercised against
    /// sqlite: those projections emit Postgres-specific SQL (`DATE_TRUNC`, `FILTER`, and a
    /// `COALESCE` column alias that collides with the raw column on sqlite).
    #[tokio::test]
    async fn list_transactions_income_branch_returns_seeded_income() {
        let db = in_memory_db().await;

        infra::projections::income::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(Uuid::new_v4()),
            amount: sea_orm::ActiveValue::Set(100.0),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            debtor_name: sea_orm::ActiveValue::Set("Employer".into()),
            ..Default::default()
        }
        .insert(&db)
        .await
        .unwrap();

        infra::projections::expenses::ActiveModel {
            transaction_id: sea_orm::ActiveValue::Set(Uuid::new_v4()),
            amount: sea_orm::ActiveValue::Set(25.0),
            currency: sea_orm::ActiveValue::Set("EUR".into()),
            creditor_name: sea_orm::ActiveValue::Set("Shop".into()),
            ..Default::default()
        }
        .insert(&db)
        .await
        .unwrap();

        let income = list_transactions(
            &db,
            None,
            None,
            Some(TransactionKind::Income),
            vec![],
            vec![],
        )
        .await
        .unwrap();

        let income_rows = income.as_array().unwrap();
        assert_eq!(income_rows.len(), 1);
        assert_eq!(income_rows[0]["amount"], 100.0);
    }

    /// Build a minimal [`TransactionData`] for service tests.
    fn minimal_transaction_data(txn_id: Uuid) -> domain::events::transactions::TransactionData {
        domain::events::transactions::TransactionData {
            transaction_id: txn_id,
            booking_date: None,
            transaction_date: None,
            amount: 10.0,
            currency: "EUR".into(),
            creditor_name: None,
            debtor_name: None,
            entry_reference: None,
            aspsp_name: "test-aspsp".to_string(),
        }
    }

    /// Categorize succeeds for a recorded transaction and appends the matching event.
    #[tokio::test]
    async fn categorize_transaction_succeeds_for_recorded_transaction() {
        let db = in_memory_db().await;
        let txn_id = Uuid::new_v4();
        infra::append_event_to_db(
            &db,
            Event::TransactionRecorded(minimal_transaction_data(txn_id)),
        )
        .await
        .unwrap();

        let msg = categorize_transaction(&db, txn_id, TransactionCategory::Groceries)
            .await
            .unwrap();
        assert_eq!(msg, "Transaction categorized!");

        let events = infra::get_all_events(&db).await.unwrap();
        assert!(
            events
                .iter()
                .any(|event| matches!(event, Event::TransactionCategorized(_)))
        );
    }

    /// Categorize rejects unknown transaction ids without appending events.
    #[tokio::test]
    async fn categorize_transaction_rejects_unknown_transaction() {
        let db = in_memory_db().await;

        let result =
            categorize_transaction(&db, Uuid::new_v4(), TransactionCategory::Groceries).await;
        assert!(result.is_err());
        assert!(infra::get_all_events(&db).await.unwrap().is_empty());
    }

    /// Classify succeeds for a recorded transaction.
    #[tokio::test]
    async fn classify_transaction_succeeds_for_recorded_transaction() {
        let db = in_memory_db().await;
        let txn_id = Uuid::new_v4();
        infra::append_event_to_db(
            &db,
            Event::TransactionRecorded(minimal_transaction_data(txn_id)),
        )
        .await
        .unwrap();

        let msg = classify_transaction(&db, txn_id, TransactionClassification::MustHave)
            .await
            .unwrap();
        assert_eq!(msg, "Transaction classified!");

        let events = infra::get_all_events(&db).await.unwrap();
        assert!(
            events
                .iter()
                .any(|event| matches!(event, Event::TransactionClassified(_)))
        );
    }

    /// Classify rejects unknown transaction ids without appending events.
    #[tokio::test]
    async fn classify_transaction_rejects_unknown_transaction() {
        let db = in_memory_db().await;

        let result =
            classify_transaction(&db, Uuid::new_v4(), TransactionClassification::MustHave).await;
        assert!(result.is_err());
        assert!(infra::get_all_events(&db).await.unwrap().is_empty());
    }

    /// Updating a note succeeds for a recorded transaction.
    #[tokio::test]
    async fn update_transaction_note_succeeds_for_recorded_transaction() {
        let db = in_memory_db().await;
        let txn_id = Uuid::new_v4();
        infra::append_event_to_db(
            &db,
            Event::TransactionRecorded(minimal_transaction_data(txn_id)),
        )
        .await
        .unwrap();

        let msg = update_transaction_note(&db, txn_id, "my note".to_string())
            .await
            .unwrap();
        assert_eq!(msg, "Transaction note updated!");

        let events = infra::get_all_events(&db).await.unwrap();
        assert!(
            events
                .iter()
                .any(|event| matches!(event, Event::TransactionNoteUpdated(_)))
        );
    }

    /// Updating a note rejects unknown transaction ids without appending events.
    #[tokio::test]
    async fn update_transaction_note_rejects_unknown_transaction() {
        let db = in_memory_db().await;

        let result = update_transaction_note(&db, Uuid::new_v4(), "my note".to_string()).await;
        assert!(result.is_err());
        assert!(infra::get_all_events(&db).await.unwrap().is_empty());
    }
}
