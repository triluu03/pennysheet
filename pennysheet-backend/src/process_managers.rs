//! Process managers.

use domain::events::Event;
use gateway::{
    client::enable_banking_client::EnableBankingClient,
    schema::enable_banking_api::transaction::{
        TransactionQueryParameters,
        TransactionResponse,
    },
};

#[derive(Debug, Clone)]
pub struct TransactionProcessManager {
    client: EnableBankingClient,
    request_id: Option<String>,
    continuation_key: Option<String>,
}

impl TransactionProcessManager {
    /// Constructor.
    ///
    /// # Errors
    /// Returns [`String`] error if the [`EnableBankingClient`] cannot be constructed.
    pub fn new(session_json: &str) -> Result<Self, String> {
        Ok(Self {
            client: EnableBankingClient::new(session_json)?,
            request_id: None,
            continuation_key: None,
        })
    }

    /// Handle an event and call Enable Banking API gateway.
    pub async fn handle(&self, event: &Event) -> Result<Option<TransactionResponse>, String> {
        match event {
            Event::ImportTransactionsRequested(data) => Ok(Some(
                self.client
                    .get_transactions(TransactionQueryParameters {
                        date_from: Some(data.start_date.to_string()),
                        date_to: Some(data.end_date.to_string()),
                        continuation_key: None,
                    })
                    .await?,
            )),
            Event::ImportTransactionsContinued(data) => Ok(Some(
                self.client
                    .get_transactions(TransactionQueryParameters {
                        date_from: None,
                        date_to: None,
                        continuation_key: Some(data.continuation_key.clone()),
                    })
                    .await?,
            )),
            Event::ImportTransactionsCompleted(_)
            | Event::ImportTransactionsFailed(_)
            | Event::TransactionRecorded(_) => Ok(None),
        }
    }

    /// Construct the state from one event.
    pub fn apply(mut self, event: &Event) -> Self {
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
                    self.request_id = None
                }
            },
            Event::TransactionRecorded(_) => {},
        }
        self
    }

    /// Construct the state from multiple events (in order).
    pub fn multi_apply(self, events: &[Event]) -> Self {
        events
            .iter()
            .fold(self, |manager, event| manager.apply(event))
    }
}
