//! Aggregates

use uuid::Uuid;

use crate::domain::{
    commands::Command,
    errors::DomainError,
    events::{
        transactions::ImportRequestData,
        Event,
    },
};

#[derive(Default, Debug, Clone, Copy)]
pub struct CoreAggregate {
    /// The ID for the pending transactions import request.
    pub request_id: Option<Uuid>,
}

impl CoreAggregate {
    /// Core aggregate constructor.
    pub fn new() -> Self {
        CoreAggregate { request_id: None }
    }

    /// Execute commands.
    ///
    /// # Errors
    /// Return [`DomainError::CommandRejected`] if the command is rejected.
    pub fn execute(&self, command: Command) -> Result<Event, DomainError> {
        match command {
            Command::ImportTransactions(c) => {
                if let Some(_request_id) = self.request_id {
                    Err(DomainError::CommandRejected(
                        "There's a pending import request awaiting to be resolved!".to_string(),
                    ))
                } else {
                    Ok(Event::ImportTransactionsRequested(ImportRequestData::new(
                        c.start_date,
                        c.end_date,
                    )))
                }
            },
        }
    }

    /// Construct the state from one event.
    pub fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::ImportTransactionsRequested(data) => {
                self.request_id = Some(data.request_id);
            },
            Event::ImportTransactionsCompleted(data) => {
                if self.request_id == Some(data.request_id) {
                    self.request_id = None
                }
            },
            Event::ImportTransactionsFailed(data) => {
                if self.request_id == Some(data.request_id) {
                    self.request_id = None
                }
            },
        }
        self
    }

    /// Construct the state from multiple events (in order).
    pub fn multi_apply(self, events: &[Event]) -> Self {
        events
            .iter()
            .fold(self, |aggregate, event| aggregate.apply(event))
    }
}
