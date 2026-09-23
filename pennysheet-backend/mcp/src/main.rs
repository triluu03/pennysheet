//! Binary entry-point for the Pennysheet MCP server.

use rmcp::{
    ServerHandler,
    ServiceExt,
    model::{
        Implementation,
        ServerCapabilities,
        ServerConfig,
    },
    tool,
    tool_handler,
    tool_router,
};

/// Pennysheet MCP server that exposes Pennysheet tools over stdio.
#[derive(Clone)]
struct PennysheetMcpServer;

#[tool_router]
impl PennysheetMcpServer {
    // TODO: placeholder/smoke-test tool; replace with real Pennysheet tools.
    #[tool(description = "Ping the Pennysheet MCP server.")]
    async fn ping(&self) -> String {
        "pong".to_string()
    }
}

#[tool_handler]
impl ServerHandler for PennysheetMcpServer {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().build())
            .with_server_info(Implementation::new(
                "pennysheet-mcp",
                env!("CARGO_PKG_VERSION"),
            ))
            .with_instructions("Pennysheet MCP server.")
    }
}

/// Main function of the Pennysheet MCP server.
///
/// # Errors
///
/// Returns an error if the stdio transport fails to serve, for example due to
/// a transport or initialization error, or if the service loop task fails
/// while waiting for the connection to close.
///
/// # Panics
///
/// Panics if a global tracing subscriber is already installed, since
/// [`tracing_subscriber::fmt().init()`] cannot be called more than once.
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt().init();
    tracing::info!("starting Pennysheet MCP server over stdio");
    let server = PennysheetMcpServer.serve(rmcp::transport::stdio()).await?;
    server.waiting().await?;
    Ok(())
}
