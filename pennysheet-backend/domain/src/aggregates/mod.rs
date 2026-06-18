//! Aggregates

use std::collections::HashSet;
use uuid::Uuid;

use crate::{
    commands::Command,
    errors::DomainError,
    events::{
        Event,
        transactions::{
            ImportRequestData,
            ImportStatusData,
        },
    },
};

#[derive(Default, Debug, Clone)]
pub struct CoreAggregate {
    pending_request_id: Option<Uuid>,
    failed_request_id_set: HashSet<Uuid>,
}

impl CoreAggregate {
    /// Construct a [`CoreAggregate`] from the current event table.
    pub fn new(all_events: &[Event]) -> Self {
        Self {
            ..Default::default()
        }
        .multi_apply(all_events)
    }

    /// Execute a command and emit events.
    ///
    /// # Errors
    /// Return [`DomainError::CommandRejected`] if the command is rejected.
    pub fn execute(&self, command: Command) -> Result<Event, DomainError> {
        match command {
            Command::ImportTransactions(c) => {
                if self.pending_request_id.is_some() {
                    Err(DomainError::CommandRejected(
                        "There's a pending request waiting to be resolved!".to_string(),
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
            Command::RetryFailedImportRequest(c) => {
                if self.pending_request_id.is_some() {
                    Err(DomainError::CommandRejected(
                        "There's a pending request waiting to be resolved!".to_string(),
                    ))
                } else if !self.failed_request_id_set.contains(&c.request_id) {
                    Err(DomainError::CommandRejected(
                        "The provided request ID is not found in the past failed requests."
                            .to_string(),
                    ))
                } else {
                    Ok(Event::TransactionImportRetryRequested(ImportStatusData {
                        request_id: c.request_id,
                    }))
                }
            },
            Command::CategorizeTransaction(data) => Ok(Event::TransactionCategorized(data)),
            Command::ClassifyTransaction(data) => Ok(Event::TransactionClassified(data)),
            Command::UpdateTransactionNote(data) => Ok(Event::TransactionNoteUpdated(data)),
        }
    }

    /// Construct the state from one event.
    pub fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::ImportTransactionsRequested(data) => {
                self.pending_request_id = Some(data.request_id);
            },
            Event::TransactionImportRetryRequested(data) => {
                self.pending_request_id = Some(data.request_id)
            },
            Event::ImportTransactionsCompleted(data) => {
                if self.pending_request_id == Some(data.request_id) {
                    self.failed_request_id_set.remove(&data.request_id);
                    self.pending_request_id = None
                }
            },
            Event::ImportTransactionsFailed(data) => {
                if self.pending_request_id == Some(data.request_id) {
                    self.failed_request_id_set.insert(data.request_id);
                    self.pending_request_id = None
                }
            },
            Event::ImportTransactionsContinued(_)
            | Event::TransactionRecorded(_)
            | Event::TransactionCategorized(_)
            | Event::TransactionClassified(_)
            | Event::TransactionNoteUpdated(_) => {
                // Ignore these events
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
        commands::{
            create_new_import_transactions_command,
            create_retry_failed_import_request_command,
        },
        events::{
            Event,
            transactions::{
                ImportRequestData,
                ImportStatusData,
            },
        },
    };

    /// Extract the request_id from an [`Event::ImportTransactionsRequested`] event.
    fn request_id_from_event(event: &Event) -> Uuid {
        match event {
            Event::ImportTransactionsRequested(data) => data.request_id,
            _ => panic!("expected ImportTransactionsRequested, got {event:?}"),
        }
    }

    /// Build an aggregate that has already seen the given request fail, so the
    /// request id is recorded in the failed-request set and is eligible for retry.
    fn aggregate_with_failed_request(request_id: Uuid) -> CoreAggregate {
        CoreAggregate::new(&[
            Event::ImportTransactionsRequested(ImportRequestData {
                request_id,
                ..Default::default()
            }),
            Event::ImportTransactionsFailed(ImportStatusData { request_id }),
        ])
    }

    #[test]
    fn execute_succeeds_with_no_pending_request() {
        let aggregate = CoreAggregate::new(&[]);
        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_ok());
    }

    #[test]
    fn execute_rejects_when_pending_request_exists() {
        let aggregate = CoreAggregate::new(&[]);
        let command = create_new_import_transactions_command(None, None).unwrap();
        let event = aggregate.execute(command).unwrap();
        let aggregate = aggregate.apply(&event);

        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_err());
    }

    #[test]
    fn execute_rejects_command_with_invalid_dates() {
        let aggregate = CoreAggregate::new(&[]);
        let invalid_command =
            create_new_import_transactions_command(Some("2026-06-05"), Some("2026-06-01")).unwrap();
        assert!(aggregate.execute(invalid_command).is_err());

        let valid_command =
            create_new_import_transactions_command(Some("2026-06-05"), Some("2026-06-05")).unwrap();
        assert!(aggregate.execute(valid_command).is_ok());
    }

    #[test]
    fn apply_completed_event_clears_pending_request() {
        let aggregate = CoreAggregate::new(&[]);
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
        let aggregate = CoreAggregate::new(&[]);
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
        let aggregate = CoreAggregate::new(&[]);
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
    fn execute_retry_succeeds_for_known_failed_request() {
        let request_id = Uuid::new_v4();
        let aggregate = aggregate_with_failed_request(request_id);

        let command = create_retry_failed_import_request_command(&request_id.to_string()).unwrap();
        let event = aggregate.execute(command).unwrap();

        assert!(matches!(
            event,
            Event::TransactionImportRetryRequested(data) if data.request_id == request_id
        ));
    }

    #[test]
    fn execute_retry_rejects_unknown_request() {
        let aggregate = CoreAggregate::new(&[]);

        // The request id was never seen failing, so there is nothing to retry.
        let command =
            create_retry_failed_import_request_command(&Uuid::new_v4().to_string()).unwrap();
        assert!(aggregate.execute(command).is_err());
    }

    #[test]
    fn execute_retry_rejects_when_pending_request_exists() {
        let request_id = Uuid::new_v4();
        // Record the failure, then start a fresh import so a request is pending again.
        let aggregate = aggregate_with_failed_request(request_id);
        let pending = create_new_import_transactions_command(None, None).unwrap();
        let requested = aggregate.execute(pending).unwrap();
        let aggregate = aggregate.apply(&requested);

        let retry = create_retry_failed_import_request_command(&request_id.to_string()).unwrap();
        assert!(aggregate.execute(retry).is_err());
    }

    #[test]
    fn apply_retry_requested_blocks_new_requests() {
        let request_id = Uuid::new_v4();
        // A retry-requested event marks a request as pending again.
        let aggregate =
            CoreAggregate::new(&[Event::TransactionImportRetryRequested(ImportStatusData {
                request_id,
            })]);

        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_err());
    }

    #[test]
    fn failed_event_makes_request_eligible_for_retry() {
        let aggregate = CoreAggregate::new(&[]);
        let command = create_new_import_transactions_command(None, None).unwrap();
        let requested = aggregate.execute(command).unwrap();
        let request_id = request_id_from_event(&requested);
        let aggregate = aggregate.apply(&requested);

        // Failing the pending request both clears it and records it as retryable.
        let failed = Event::ImportTransactionsFailed(ImportStatusData { request_id });
        let aggregate = aggregate.apply(&failed);

        let retry = create_retry_failed_import_request_command(&request_id.to_string()).unwrap();
        assert!(aggregate.execute(retry).is_ok());
    }

    #[test]
    fn multi_apply_handles_full_request_lifecycle() {
        let aggregate = CoreAggregate::new(&[]);
        let command = create_new_import_transactions_command(None, None).unwrap();
        let requested = aggregate.execute(command).unwrap();
        let request_id = request_id_from_event(&requested);
        let completed = Event::ImportTransactionsCompleted(ImportStatusData { request_id });

        let aggregate = CoreAggregate::new(&[]).multi_apply(&[requested, completed]);

        let command = create_new_import_transactions_command(None, None).unwrap();
        assert!(aggregate.execute(command).is_ok());
    }
}
