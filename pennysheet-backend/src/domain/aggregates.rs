//! Aggregates

use crate::domain::{
    commands::Command,
    errors::DomainError,
    events::{
        Event,
        transactions::ImportRequestData,
    },
};

#[derive(Default, Debug, Clone, Copy)]
pub struct CoreAggregate {}

impl CoreAggregate {
    /// Core aggregate constructor.
    pub fn new() -> Self {
        CoreAggregate {}
    }

    /// Execute commands.
    ///
    /// # Errors
    /// Return a DomainError if the command is rejected.
    pub fn execute(&self, command: Command) -> Result<Event, DomainError> {
        match command {
            Command::ImportTransactions(c) => Ok(Event::ImportTransactionsRequested(
                ImportRequestData::new(c.start_date, c.end_date),
            )),
        }
    }
}
