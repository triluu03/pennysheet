//! Aggregates

use crate::domain::{
    commands::Command,
    errors::DomainError,
    events::{
        transactions::ImportTransactionsRequested,
        Event,
    },
};

pub struct CoreAggregate {}

impl CoreAggregate {
    /// Core aggregate constructor.
    pub fn new() -> Self {
        CoreAggregate {}
    }

    /// Execute commands.
    pub fn execute(&self, command: Command) -> Result<Event, DomainError> {
        match command {
            Command::ImportTransactions(c) => Ok(Event::ImportTransactionsRequested(
                ImportTransactionsRequested::new(c.start_date, c.end_date),
            )),
        }
    }
}
