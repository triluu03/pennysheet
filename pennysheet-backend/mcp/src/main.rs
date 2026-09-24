//! Binary entry-point for the Pennysheet MCP server.

use std::sync::Arc;

use chrono::NaiveDate;
use domain::events::{
    TransactionCategory,
    TransactionClassification,
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
    services::transactions::{
        self,
        TransactionKind,
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

#[tool_router]
impl PennysheetMcpServer {
    #[tool(description = "Ping the Pennysheet MCP server.")]
    async fn ping(&self) -> String {
        "pong".to_string()
    }

    #[tool(description = "List transactions matching the given filters.")]
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

    #[tool(description = "List transactions time-aggregated at the given level.")]
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
}
