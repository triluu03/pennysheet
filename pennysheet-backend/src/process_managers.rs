//! Process managers.

use domain::{
    event_injectors::EventInjector,
    events::{
        Event,
        transactions::ImportStatusData,
    },
};
use gateway::{
    client::enable_banking_client::EnableBankingClient,
    schema::enable_banking_api::transaction::{
        TransactionQueryParameters,
        TransactionResponse,
    },
};
use infra::{
    DatabaseConnection,
    append_event_to_db,
    append_multi_events_to_db,
    get_all_events,
};
use tracing::{
    debug,
    error,
    info,
    instrument,
};
use uuid::Uuid;

#[derive(Debug, Clone)]
struct TransactionProcessManager {
    client: EnableBankingClient,
    request_id: Option<String>,
    continuation_key: Option<String>,
}

impl TransactionProcessManager {
    /// Constructor.
    ///
    /// # Errors
    /// Returns [`String`] error if the [`EnableBankingClient`] cannot be constructed.
    fn new(session_json: &str) -> Result<Self, String> {
        Ok(Self {
            client: EnableBankingClient::new(session_json)?,
            request_id: None,
            continuation_key: None,
        })
    }

    /// Handle an event and call Enable Banking API gateway.
    #[instrument(skip(self, event))]
    async fn handle(&self, event: &Event) -> Result<Option<TransactionResponse>, String> {
        match event {
            Event::ImportTransactionsRequested(data) => {
                debug!("handling ImportTransactionsRequested");
                Ok(Some(
                    self.client
                        .get_transactions(TransactionQueryParameters {
                            date_from: Some(data.start_date.to_string()),
                            date_to: Some(data.end_date.to_string()),
                            continuation_key: None,
                        })
                        .await?,
                ))
            },
            Event::ImportTransactionsContinued(data) => {
                debug!("handling ImportTransactionsContinued");
                Ok(Some(
                    self.client
                        .get_transactions(TransactionQueryParameters {
                            date_from: Some(data.start_date.to_string()),
                            date_to: Some(data.end_date.to_string()),
                            continuation_key: Some(data.continuation_key.clone()),
                        })
                        .await?,
                ))
            },
            Event::ImportTransactionsCompleted(_)
            | Event::ImportTransactionsFailed(_)
            | Event::TransactionRecorded(_) => Ok(None),
        }
    }

    /// Construct the state from one event.
    #[instrument(skip(self, event))]
    fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::ImportTransactionsRequested(data) => {
                self.request_id = Some(data.request_id.to_string())
            },
            Event::ImportTransactionsContinued(data) => {
                let continued_request_id = data.request_id.to_string();
                if self.request_id == Some(continued_request_id) {
                    self.continuation_key = Some(data.continuation_key.clone())
                }
            },
            Event::ImportTransactionsCompleted(data) | Event::ImportTransactionsFailed(data) => {
                let event_request_id = data.request_id.to_string();
                if self.request_id == Some(event_request_id) {
                    self.request_id = None;
                    self.continuation_key = None;
                }
            },
            Event::TransactionRecorded(_) => {},
        }
        self
    }

    /// Construct the state from multiple events (in order).
    #[instrument(skip(self, events))]
    fn multi_apply(self, events: &[Event]) -> Self {
        events
            .iter()
            .fold(self, |manager, event| manager.apply(event))
    }
}

/// Run a transaction import.
///
/// This task is meant to be run in the background to avoid blocking the clients.
#[instrument(skip(db, session_json, request_event), fields(%request_id))]
pub async fn run_transaction_import(
    db: DatabaseConnection,
    session_json: String,
    request_id: Uuid,
    request_event: Event,
) {
    info!("starting transaction import");

    let manager = match TransactionProcessManager::new(&session_json) {
        Ok(manager) => manager,
        Err(error) => {
            return fail_import(&db, request_id, "init transaction process manager", &error).await;
        },
    };

    // Initialize the event injector.
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

    let mut injector = match EventInjector::new(&current_event_table) {
        Ok(injector) => injector,
        Err(error) => {
            return fail_import(&db, request_id, "init event injector", &error.to_string()).await;
        },
    };
    let mut current_event = request_event;
    loop {
        let response = match manager.handle(&current_event).await {
            Ok(Some(response)) => response,
            Ok(None) => return,
            Err(error) => return fail_import(&db, request_id, "fetch transactions", &error).await,
        };

        // TODO: address this unwrap.
        let new_events = injector.inject_transaction_events(response).unwrap();
        injector = injector.multi_apply(&new_events);

        let continuation_event = new_events
            .iter()
            .find(|event| matches!(event, Event::ImportTransactionsContinued(_)))
            .cloned();

        info!("injecting {} new events", new_events.len());
        if let Err(error) = append_multi_events_to_db(&db, new_events).await {
            return fail_import(&db, request_id, "inject new events", &error.to_string()).await;
        }

        match continuation_event {
            Some(continued) => current_event = continued,
            None => {
                info!("transaction import completed");
                return;
            },
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
