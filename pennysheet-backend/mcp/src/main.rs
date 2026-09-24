//! Binary entry-point for the Pennysheet MCP server.

use std::sync::Arc;

use rmcp::{
    ServerHandler,
    ServiceExt,
    tool,
    tool_handler,
    tool_router,
};
use service::{
    AppState,
    database::connect_and_prepare,
};

/// Pennysheet MCP server that exposes Pennysheet tools over stdio.
#[derive(Clone)]
struct PennysheetMcpServer {
    /// Shared application state.
    ///
    /// Unused until the first real tools land in Batch 1; kept now so bootstrap wiring is in
    /// place.
    #[allow(dead_code)]
    state: Arc<AppState>,
}

#[tool_router]
impl PennysheetMcpServer {
    // TODO: placeholder/smoke-test tool; replace with real Pennysheet tools.
    #[tool(description = "Ping the Pennysheet MCP server.")]
    async fn ping(&self) -> String {
        "pong".to_string()
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
