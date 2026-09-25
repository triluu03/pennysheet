//! Binary entry-point for the Pennysheet MCP server.

use std::sync::Arc;

use chrono::NaiveDate;
use domain::events::{
    TransactionCategory,
    TransactionClassification,
    budgets::BudgetType,
};
use infra::projections::TimeAggregation;
use rmcp::{
    ServerHandler,
    ServiceExt,
    handler::server::wrapper::Parameters,
    tool,
    tool_handler,
    tool_router,
};
use service::{
    AppState,
    database::connect_and_prepare,
    services::{
        budgets as budget_service,
        import_requests as import_request_service,
        sessions as session_service,
        transactions::{
            self,
            TransactionKind,
        },
        user_settings as user_setting_service,
    },
};
use uuid::Uuid;

/// Pennysheet MCP server that exposes Pennysheet tools over stdio.
#[derive(Clone)]
struct PennysheetMcpServer {
    /// Shared application state.
    state: Arc<AppState>,
}

/// Parameters for the `list_transactions` tool.
#[derive(serde::Deserialize, rmcp::schemars::JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
struct ListTransactionsParams {
    /// Start date filter in `YYYY-MM-DD` format.
    #[serde(default)]
    start_date: Option<NaiveDate>,
    /// End date filter in `YYYY-MM-DD` format.
    #[serde(default)]
    end_date: Option<NaiveDate>,
    /// Transaction kind filter: `income` or `expenses`.
    #[serde(default)]
    kind: Option<TransactionKind>,
    /// Transaction category filters.
    #[serde(default)]
    categories: Vec<TransactionCategory>,
    /// Transaction classification filters.
    #[serde(default)]
    classifications: Vec<TransactionClassification>,
}

/// Parameters for the `get_transaction` tool.
#[derive(serde::Deserialize, rmcp::schemars::JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
struct GetTransactionParams {
    /// Transaction ID.
    transaction_id: Uuid,
}

/// Parameters for the `aggregate_transactions` tool.
#[derive(serde::Deserialize, rmcp::schemars::JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
struct AggregateTransactionsParams {
    /// Start date filter in `YYYY-MM-DD` format.
    #[serde(default)]
    start_date: Option<NaiveDate>,
    /// End date filter in `YYYY-MM-DD` format.
    #[serde(default)]
    end_date: Option<NaiveDate>,
    /// Aggregation level: `daily`, `weekly`, or `monthly`.
    aggregated_level: TimeAggregation,
    /// Transaction kind filter: `income` or `expenses`.
    #[serde(default)]
    kind: Option<TransactionKind>,
    /// Transaction category filters.
    #[serde(default)]
    categories: Vec<TransactionCategory>,
    /// Transaction classification filters.
    #[serde(default)]
    classifications: Vec<TransactionClassification>,
}

/// Parameters for the `get_budget` tool.
#[derive(serde::Deserialize, rmcp::schemars::JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
struct GetBudgetParams {
    /// Budget type: `weekly` or `monthly`.
    budget_type: BudgetType,
}

/// Parameters for the `pivot_expenses` tool.
#[derive(serde::Deserialize, rmcp::schemars::JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
struct PivotExpensesParams {
    /// Start date filter in `YYYY-MM-DD` format.
    #[serde(default)]
    start_date: Option<NaiveDate>,
    /// End date filter in `YYYY-MM-DD` format.
    #[serde(default)]
    end_date: Option<NaiveDate>,
    /// Transaction category filters.
    #[serde(default)]
    categories: Vec<TransactionCategory>,
    /// Transaction classification filters.
    #[serde(default)]
    classifications: Vec<TransactionClassification>,
}

/// Parameters for the `categorize_transaction` tool.
#[derive(serde::Deserialize, rmcp::schemars::JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
struct CategorizeTransactionParams {
    /// Transaction ID.
    transaction_id: Uuid,
    /// Transaction category.
    category: TransactionCategory,
}

/// Parameters for the `classify_transaction` tool.
#[derive(serde::Deserialize, rmcp::schemars::JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
struct ClassifyTransactionParams {
    /// Transaction ID.
    transaction_id: Uuid,
    /// Transaction classification.
    classification: TransactionClassification,
}

/// Parameters for the `update_transaction_note` tool.
#[derive(serde::Deserialize, rmcp::schemars::JsonSchema)]
#[schemars(crate = "rmcp::schemars")]
struct UpdateTransactionNoteParams {
    /// Transaction ID.
    transaction_id: Uuid,
    /// Note to store.
    note: String,
}

#[tool_router]
impl PennysheetMcpServer {
    #[tool(description = "Ping the Pennysheet MCP server.")]
    async fn ping(&self) -> String {
        "pong".to_string()
    }

    #[tool(description = "Get transactions matching the given filters.")]
    async fn list_transactions(
        &self,
        Parameters(params): Parameters<ListTransactionsParams>,
    ) -> Result<String, String> {
        let value = transactions::list_transactions(
            &self.state.db,
            params.start_date,
            params.end_date,
            params.kind,
            params.categories,
            params.classifications,
        )
        .await
        .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }

    #[tool(description = "Get a single transaction by ID.")]
    async fn get_transaction(
        &self,
        Parameters(params): Parameters<GetTransactionParams>,
    ) -> Result<String, String> {
        let value = transactions::get_transaction(&self.state.db, params.transaction_id)
            .await
            .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }

    #[tool(description = "Get time-aggregated transactions at the given level.")]
    async fn aggregate_transactions(
        &self,
        Parameters(params): Parameters<AggregateTransactionsParams>,
    ) -> Result<String, String> {
        let value = transactions::aggregate_transactions(
            &self.state.db,
            params.start_date,
            params.end_date,
            params.aggregated_level,
            params.kind,
            params.categories,
            params.classifications,
        )
        .await
        .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }

    #[tool(description = "Build the expenses pivot table for the given filters.")]
    async fn pivot_expenses(
        &self,
        Parameters(params): Parameters<PivotExpensesParams>,
    ) -> Result<String, String> {
        let value = transactions::pivot_expenses(
            &self.state.db,
            params.start_date,
            params.end_date,
            params.categories,
            params.classifications,
        )
        .await
        .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }

    #[tool(description = "Assign a category to a transaction.")]
    async fn categorize_transaction(
        &self,
        Parameters(params): Parameters<CategorizeTransactionParams>,
    ) -> Result<String, String> {
        transactions::categorize_transaction(&self.state.db, params.transaction_id, params.category)
            .await
            .map_err(|e| e.to_string())
    }

    #[tool(description = "Assign a classification to a transaction.")]
    async fn classify_transaction(
        &self,
        Parameters(params): Parameters<ClassifyTransactionParams>,
    ) -> Result<String, String> {
        transactions::classify_transaction(
            &self.state.db,
            params.transaction_id,
            params.classification,
        )
        .await
        .map_err(|e| e.to_string())
    }

    #[tool(description = "Update the note of a transaction.")]
    async fn update_transaction_note(
        &self,
        Parameters(params): Parameters<UpdateTransactionNoteParams>,
    ) -> Result<String, String> {
        transactions::update_transaction_note(&self.state.db, params.transaction_id, params.note)
            .await
            .map_err(|e| e.to_string())
    }

    #[tool(description = "List weekly and monthly budget tracking data.")]
    async fn list_budgets(&self) -> Result<String, String> {
        let value = budget_service::list_budgets(&self.state.db)
            .await
            .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }

    #[tool(description = "Get a single budget type's tracking data.")]
    async fn get_budget(
        &self,
        Parameters(params): Parameters<GetBudgetParams>,
    ) -> Result<String, String> {
        let value = budget_service::get_budget(&self.state.db, params.budget_type)
            .await
            .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }

    #[tool(description = "List stored Enable Banking sessions split into valid and expired.")]
    async fn list_sessions(&self) -> Result<String, String> {
        let value = session_service::list_sessions(&self.state.db)
            .await
            .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }

    #[tool(description = "List all user settings.")]
    async fn list_settings(&self) -> Result<String, String> {
        let value = user_setting_service::list_settings(&self.state.db)
            .await
            .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }

    #[tool(description = "List import requests.")]
    async fn list_import_requests(&self) -> Result<String, String> {
        let value = import_request_service::list_import_requests(&self.state.db)
            .await
            .map_err(|e| e.to_string())?;

        serde_json::to_string(&value).map_err(|e| e.to_string())
    }
}

#[tool_handler(name = "pennysheet-mcp", instructions = "Pennysheet MCP server.")]
impl ServerHandler for PennysheetMcpServer {}

/// Main function of the Pennysheet MCP server.
///
/// # Errors
///
/// Returns an error if the database bootstrap fails, if the stdio transport fails to serve, for
/// example due to a transport or initialization error, or if the service loop task fails while
/// waiting for the connection to close.
///
/// # Panics
///
/// Panics if a global tracing subscriber is already installed, since
/// [`tracing_subscriber::fmt().init()`] cannot be called more than once.
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt().init();
    tracing::info!("starting Pennysheet MCP server over stdio");

    let db = connect_and_prepare()
        .await
        .inspect_err(|error| tracing::error!(%error, "failed to bootstrap Pennysheet services"))?;

    let server = PennysheetMcpServer {
        state: Arc::new(AppState { db }),
    }
    .serve(rmcp::transport::stdio())
    .await?;

    server.waiting().await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use domain::events::Event;

    /// Build a server backed by an empty in-memory database.
    async fn in_memory_server() -> PennysheetMcpServer {
        let db = sea_orm::Database::connect("sqlite::memory:").await.unwrap();
        infra::sync_database_schema(&db).await.unwrap();
        PennysheetMcpServer {
            state: Arc::new(AppState { db }),
        }
    }

    /// `list_transactions` against an empty database succeeds with an empty JSON array.
    #[tokio::test]
    async fn list_transactions_returns_empty_json_array() {
        let server = in_memory_server().await;

        let result = server
            .list_transactions(Parameters(ListTransactionsParams {
                start_date: None,
                end_date: None,
                kind: None,
                categories: vec![],
                classifications: vec![],
            }))
            .await
            .unwrap();

        assert_eq!(result, "[]");
    }

    /// `list_budgets` against an empty database returns empty weekly and monthly arrays.
    #[tokio::test]
    async fn list_budgets_returns_empty_json_object() {
        let server = in_memory_server().await;

        let result = server.list_budgets().await.unwrap();

        assert_eq!(result, "{\"weekly\":[],\"monthly\":[]}");
    }

    /// `get_budget` against an empty database returns an empty JSON array.
    #[tokio::test]
    async fn get_budget_returns_empty_json_array() {
        let server = in_memory_server().await;

        let result = server
            .get_budget(Parameters(GetBudgetParams {
                budget_type: BudgetType::Monthly,
            }))
            .await
            .unwrap();

        assert_eq!(result, "[]");
    }

    /// `list_sessions` against an empty database returns empty valid and expired arrays.
    #[tokio::test]
    async fn list_sessions_returns_empty_json_object() {
        let server = in_memory_server().await;

        let result = server.list_sessions().await.unwrap();

        assert_eq!(result, "{\"valid_sessions\":[],\"expired_sessions\":[]}");
    }

    /// `list_settings` against an empty database returns an empty JSON array.
    #[tokio::test]
    async fn list_settings_returns_empty_json_array() {
        let server = in_memory_server().await;

        let result = server.list_settings().await.unwrap();

        assert_eq!(result, "[]");
    }

    /// `list_import_requests` against an empty database returns an empty JSON array.
    #[tokio::test]
    async fn list_import_requests_returns_empty_json_array() {
        let server = in_memory_server().await;

        let result = server.list_import_requests().await.unwrap();

        assert_eq!(result, "[]");
    }

    /// Build a minimal [`TransactionData`] for MCP tool tests.
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

    /// `categorize_transaction` succeeds for a recorded transaction.
    #[tokio::test]
    async fn categorize_transaction_succeeds_for_recorded_transaction() {
        let server = in_memory_server().await;
        let txn_id = Uuid::new_v4();
        infra::append_event_to_db(
            &server.state.db,
            Event::TransactionRecorded(minimal_transaction_data(txn_id)),
        )
        .await
        .unwrap();

        let result = server
            .categorize_transaction(Parameters(CategorizeTransactionParams {
                transaction_id: txn_id,
                category: TransactionCategory::Groceries,
            }))
            .await;

        assert_eq!(result, Ok("Transaction categorized!".to_string()));
    }

    /// `categorize_transaction` rejects an unknown transaction id.
    #[tokio::test]
    async fn categorize_transaction_rejects_unknown_transaction() {
        let server = in_memory_server().await;

        let result = server
            .categorize_transaction(Parameters(CategorizeTransactionParams {
                transaction_id: Uuid::new_v4(),
                category: TransactionCategory::Groceries,
            }))
            .await;

        assert!(result.is_err());
    }

    /// `classify_transaction` succeeds for a recorded transaction.
    #[tokio::test]
    async fn classify_transaction_succeeds_for_recorded_transaction() {
        let server = in_memory_server().await;
        let txn_id = Uuid::new_v4();
        infra::append_event_to_db(
            &server.state.db,
            Event::TransactionRecorded(minimal_transaction_data(txn_id)),
        )
        .await
        .unwrap();

        let result = server
            .classify_transaction(Parameters(ClassifyTransactionParams {
                transaction_id: txn_id,
                classification: TransactionClassification::MustHave,
            }))
            .await;

        assert_eq!(result, Ok("Transaction classified!".to_string()));
    }

    /// `classify_transaction` rejects an unknown transaction id.
    #[tokio::test]
    async fn classify_transaction_rejects_unknown_transaction() {
        let server = in_memory_server().await;

        let result = server
            .classify_transaction(Parameters(ClassifyTransactionParams {
                transaction_id: Uuid::new_v4(),
                classification: TransactionClassification::MustHave,
            }))
            .await;

        assert!(result.is_err());
    }

    /// `update_transaction_note` succeeds for a recorded transaction.
    #[tokio::test]
    async fn update_transaction_note_succeeds_for_recorded_transaction() {
        let server = in_memory_server().await;
        let txn_id = Uuid::new_v4();
        infra::append_event_to_db(
            &server.state.db,
            Event::TransactionRecorded(minimal_transaction_data(txn_id)),
        )
        .await
        .unwrap();

        let result = server
            .update_transaction_note(Parameters(UpdateTransactionNoteParams {
                transaction_id: txn_id,
                note: "my note".to_string(),
            }))
            .await;

        assert_eq!(result, Ok("Transaction note updated!".to_string()));
    }

    /// `update_transaction_note` rejects an unknown transaction id.
    #[tokio::test]
    async fn update_transaction_note_rejects_unknown_transaction() {
        let server = in_memory_server().await;

        let result = server
            .update_transaction_note(Parameters(UpdateTransactionNoteParams {
                transaction_id: Uuid::new_v4(),
                note: "my note".to_string(),
            }))
            .await;

        assert!(result.is_err());
    }
}
