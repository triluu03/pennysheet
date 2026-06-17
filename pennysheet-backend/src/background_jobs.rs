//! Background jobs.

use domain::{
    commands::GatewayCommand,
    event_injectors::EventInjector,
    events::{
        Event,
        transactions::ImportStatusData,
    },
    process_managers::TransactionProcessManager,
};
use gateway::client::enable_banking_client::EnableBankingClient;
use infra::{
    DatabaseConnection,
    append_event_to_db,
    append_multi_events_to_db,
    get_all_events,
};
use tracing::{
    error,
    info,
    instrument,
};
use uuid::Uuid;

/// Run a transaction import.
///
/// This task is meant to be run in the background to avoid blocking the clients.
#[instrument(skip(db, session_json), fields(%request_id))]
pub async fn run_transaction_import(
    db: DatabaseConnection,
    session_json: String,
    request_id: Uuid,
) {
    info!("starting transaction import");
    let client = match EnableBankingClient::new(&session_json) {
        Ok(client) => client,
        Err(error) => {
            return fail_import(
                &db,
                request_id,
                "init Enable Banking client",
                &error.to_string(),
            )
            .await;
        },
    };

    let current_event_table = match get_all_events(&db).await {
        Ok(events) => events,
        Err(error) => {
            return fail_import(
                &db,
                request_id,
                "get the current event table",
                &error.to_string(),
            )
            .await;
        },
    };

    let mut manager = match TransactionProcessManager::new(&current_event_table) {
        Ok(manager) => manager,
        Err(error) => {
            return fail_import(
                &db,
                request_id,
                "init transaction process manager",
                &error.to_string(),
            )
            .await;
        },
    };

    let mut injector = match EventInjector::new(&current_event_table) {
        Ok(injector) => injector,
        Err(error) => {
            return fail_import(&db, request_id, "init event injector", &error.to_string()).await;
        },
    };

    loop {
        let gateway_query_params = match manager.create_gateway_command() {
            Ok(GatewayCommand::ImportTransactions(query_params)) => query_params,
            Err(error) => {
                return fail_import(&db, request_id, "issue gateway command", &error.to_string())
                    .await;
            },
        };

        let response = match client.get_transactions(gateway_query_params).await {
            Ok(response) => response,
            Err(error) => {
                return fail_import(&db, request_id, "fetch transactions", &error.to_string())
                    .await;
            },
        };

        let new_events = match injector.inject_transaction_events(response) {
            Ok(new_events) => new_events,
            Err(error) => {
                return fail_import(
                    &db,
                    request_id,
                    "inject events from response",
                    &error.to_string(),
                )
                .await;
            },
        };

        // Let process managers and event injectors consume new events.
        manager = manager.multi_apply(&new_events);
        injector = injector.multi_apply(&new_events);

        let completed_event = new_events
            .iter()
            .find(|event| matches!(event, Event::ImportTransactionsCompleted(_)))
            .cloned();
        let failed_event = new_events
            .iter()
            .find(|event| matches!(event, Event::ImportTransactionsFailed(_)))
            .cloned();

        info!("injecting {} new events", new_events.len());
        if let Err(error) = append_multi_events_to_db(&db, new_events).await {
            return fail_import(&db, request_id, "inject new events", &error.to_string()).await;
        }

        if completed_event.is_some() {
            info!("transaction import completed");
            return;
        }
        if failed_event.is_some() {
            error!("transaction import failed");
            return;
        }
    }
}

/// Record a failed import.
///
/// Append an [`Event::ImportTransactionsFailed`] and log the cause.
async fn fail_import(db: &DatabaseConnection, request_id: Uuid, context: &str, error: &str) {
    error!(%request_id, context, error, "transaction import failed");

    let failed_event = Event::ImportTransactionsFailed(ImportStatusData { request_id });
    if let Err(error) = append_event_to_db(db, failed_event).await {
        error!(
            %request_id,
            %error,
            "failed to append ImportTransactionsFailed event",
        );
    }
}
