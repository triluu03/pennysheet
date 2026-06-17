//! Process managers.

use std::collections::HashMap;

use chrono::NaiveDate;
use gateway::schema::enable_banking_api::transaction::TransactionQueryParameters;
use uuid::Uuid;

use crate::{
    commands::GatewayCommand,
    errors::DomainError,
    events::Event,
};

#[derive(Default, Debug)]
pub struct TransactionProcessManager {
    /// ID of the current pending import request.
    pending_request_id: Option<Uuid>,
    /// Data of the current pending import request.
    pending_request_data: Option<RequestData>,
    /// Map of all failed import requests with request ID as keys
    /// and [`RequestData`] as values.
    failed_request_map: HashMap<Uuid, RequestData>,
}

#[derive(Default, Debug, Clone)]
struct RequestData {
    start_date: NaiveDate,
    end_date: NaiveDate,
    continuation_key: Option<String>,
}

impl TransactionProcessManager {
    /// Construct a [`TransactionProcessManager`] from the current event table.
    ///
    /// # Errors
    /// Returns [`DomainError`] if there's no pending transaction import request.
    pub fn new(all_events: &[Event]) -> Result<Self, DomainError> {
        let new_self = Self {
            ..Default::default()
        }
        .multi_apply(all_events);

        match new_self.pending_request_id {
            None => Err(DomainError::ComponentInit(
                "no pending request ID to initialize transaction process manager with".to_string(),
            )),
            Some(_) => Ok(new_self),
        }
    }

    /// Create a [`GatewayCommand`] command.
    ///
    /// # Errors
    /// Returns [`DomainError::CommandCreation`] if no pending request or its data is found in the
    /// current state of [`TransactionProcessManager`].
    pub fn create_gateway_command(&self) -> Result<GatewayCommand, DomainError> {
        match (&self.pending_request_id, &self.pending_request_data) {
            (Some(_), Some(data)) => Ok(GatewayCommand::ImportTransactions(
                TransactionQueryParameters {
                    date_from: Some(data.start_date.to_string()),
                    date_to: Some(data.end_date.to_string()),
                    continuation_key: data.continuation_key.clone(),
                },
            )),
            _ => Err(DomainError::CommandCreation(
                "No pending request found in the transaction process manager!".to_string(),
            )),
        }
    }

    /// Construct the state from one event.
    pub fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::ImportTransactionsRequested(data) => {
                self.pending_request_id = Some(data.request_id);
                self.pending_request_data = Some(RequestData {
                    start_date: data.start_date,
                    end_date: data.end_date,
                    continuation_key: None,
                });
            },
            Event::ImportTransactionsContinued(data) => {
                if self.pending_request_id == Some(data.request_id) {
                    self.pending_request_data = Some(RequestData {
                        start_date: data.start_date,
                        end_date: data.end_date,
                        continuation_key: Some(data.continuation_key.clone()),
                    })
                }
            },
            Event::ImportTransactionsCompleted(data) => {
                if self.pending_request_id == Some(data.request_id) {
                    if let Some(request_id) = self.pending_request_id {
                        self.failed_request_map.remove(&request_id);
                    };

                    self.pending_request_id = None;
                    self.pending_request_data = None;
                }
            },
            Event::ImportTransactionsFailed(data) => {
                if self.pending_request_id == Some(data.request_id) {
                    if let (Some(request_id), Some(request_data)) =
                        (self.pending_request_id, self.pending_request_data)
                    {
                        self.failed_request_map.insert(request_id, request_data);
                    };

                    self.pending_request_id = None;
                    self.pending_request_data = None;
                }
            },
            Event::TransactionImportRetryRequested(data) => {
                if let Some(request_data) = self.failed_request_map.get(&data.request_id) {
                    self.pending_request_id = Some(data.request_id);
                    self.pending_request_data = Some(request_data.to_owned());
                };
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
