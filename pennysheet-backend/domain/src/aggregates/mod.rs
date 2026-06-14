//! Aggregates

use crate::{
    commands::Command,
    errors::DomainError,
    events::{
        transactions::ImportRequestData,
        Event,
    },
};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Copy)]
pub struct CoreAggregate {
    request_id: Option<Uuid>,
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
                        "There's a pending request awaiting to be resolved!".to_string(),
                    ))
                } else if c.start_date > c.end_date {
                    Err(DomainError::CommandRejected(
                        "Start date is set to be after end date in the command!".to_string(),
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

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use super::CoreAggregate;
    use crate::{
        commands::create_new_import_transactions_command,
        events::{
            transactions::ImportStatusData,
            Event,
        },
    };

    /// Extract the request_id from an [`Event::ImportTransactionsRequested`] event.
    fn request_id_from_event(event: &Event) -> Uuid {
        match event {
            Event::ImportTransactionsRequested(data) => data.request_id,
            _ => panic!("expected ImportTransactionsRequested, got {event:?}"),
        }
    }

    #[test]
    fn execute_succeeds_with_no_pending_request() {
        let aggregate = CoreAggregate::new();
        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_ok());
    }

    #[test]
    fn execute_rejects_when_pending_request_exists() {
        let aggregate = CoreAggregate::new();
        let command = create_new_import_transactions_command(None, None).unwrap();
        let event = aggregate.execute(command).unwrap();
        let aggregate = aggregate.apply(&event);

        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_err());
    }

    #[test]
    fn execute_rejects_command_with_invalid_dates() {
        let aggregate = CoreAggregate::new();
        let invalid_command =
            create_new_import_transactions_command(Some("2026-06-05"), Some("2026-06-01")).unwrap();
        assert!(aggregate.execute(invalid_command).is_err());

        let valid_command =
            create_new_import_transactions_command(Some("2026-06-05"), Some("2026-06-05")).unwrap();
        assert!(aggregate.execute(valid_command).is_ok());
    }

    #[test]
    fn apply_completed_event_clears_pending_request() {
        let aggregate = CoreAggregate::new();
        let command = create_new_import_transactions_command(None, None).unwrap();
        let requested = aggregate.execute(command).unwrap();
        let request_id = request_id_from_event(&requested);
        let aggregate = aggregate.apply(&requested);

        let completed = Event::ImportTransactionsCompleted(ImportStatusData { request_id });
        let aggregate = aggregate.apply(&completed);

        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_ok());
    }

    #[test]
    fn apply_failed_event_clears_pending_request() {
        let aggregate = CoreAggregate::new();
        let command = create_new_import_transactions_command(None, None).unwrap();
        let requested = aggregate.execute(command).unwrap();
        let request_id = request_id_from_event(&requested);
        let aggregate = aggregate.apply(&requested);

        let failed = Event::ImportTransactionsFailed(ImportStatusData { request_id });
        let aggregate = aggregate.apply(&failed);

        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_ok());
    }

    #[test]
    fn apply_mismatched_completed_event_keeps_request_pending() {
        let aggregate = CoreAggregate::new();
        let command = create_new_import_transactions_command(None, None).unwrap();
        let requested = aggregate.execute(command).unwrap();
        let aggregate = aggregate.apply(&requested);

        // A completed event for a different request should not unblock the aggregate.
        let completed = Event::ImportTransactionsCompleted(ImportStatusData {
            request_id: Uuid::new_v4(),
        });
        let aggregate = aggregate.apply(&completed);

        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_err());
    }

    #[test]
    fn multi_apply_handles_full_request_lifecycle() {
        let aggregate = CoreAggregate::new();
        let command = create_new_import_transactions_command(None, None).unwrap();
        let requested = aggregate.execute(command).unwrap();
        let request_id = request_id_from_event(&requested);
        let completed = Event::ImportTransactionsCompleted(ImportStatusData { request_id });

        let aggregate = CoreAggregate::new().multi_apply(&[requested, completed]);

        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_ok());
    }
}
