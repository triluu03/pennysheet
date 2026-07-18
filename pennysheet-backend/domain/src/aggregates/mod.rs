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
    /// Whether there are pending requests ongoing.
    having_pending_requests: bool,
    /// A set of sessions in use for pending requests.
    sessions_being_used_set: HashSet<i64>,
    /// A set of all failed requests' IDs and their corresponding sessions.
    failed_request_id_set: HashSet<(Uuid, i64)>,
    /// Set of UUIDs for recorded transactions. This is used to avoid duplication when injecting
    /// new transaction events into the event table.
    recorded_transaction_id_set: HashSet<Uuid>,
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
                if self.having_pending_requests
                    & self.sessions_being_used_set.contains(&c.session_id)
                {
                    Err(DomainError::CommandRejected(
                        "There are pending requests waiting to be resolved!".to_string(),
                    ))
                } else if c.start_date > c.end_date {
                    Err(DomainError::CommandRejected(
                        "Start date is set to be after end date in the command!".to_string(),
                    ))
                } else {
                    Ok(Event::ImportTransactionsRequested(ImportRequestData::new(
                        c.start_date,
                        c.end_date,
                        c.session_id,
                    )))
                }
            },
            Command::RetryFailedImportRequest(c) => {
                // NOTE: a retry request with an available session should not be rejected!
                // TODO: accept a retry request if its corresponding session is not in use.
                if self.having_pending_requests {
                    Err(DomainError::CommandRejected(
                        "There are pending requests waiting to be resolved!".to_string(),
                    ))
                } else if !self
                    .failed_request_id_set
                    .contains(&(c.request_id, c.session_id))
                {
                    Err(DomainError::CommandRejected(
                        "The provided request ID and its session are not found in the past failed \
                         requests."
                            .to_string(),
                    ))
                } else {
                    Ok(Event::TransactionImportRetryRequested(ImportStatusData {
                        request_id: c.request_id,
                        session_id: c.session_id,
                    }))
                }
            },
            Command::CategorizeTransaction(data) => {
                if self
                    .recorded_transaction_id_set
                    .contains(&data.transaction_id)
                {
                    Ok(Event::TransactionCategorized(data))
                } else {
                    Err(DomainError::CommandRejected(
                        "The requested transaction ID is not found!".to_string(),
                    ))
                }
            },
            Command::ClassifyTransaction(data) => {
                if self
                    .recorded_transaction_id_set
                    .contains(&data.transaction_id)
                {
                    Ok(Event::TransactionClassified(data))
                } else {
                    Err(DomainError::CommandRejected(
                        "The requested transaction ID is not found!".to_string(),
                    ))
                }
            },
            Command::UpdateTransactionNote(data) => {
                if self
                    .recorded_transaction_id_set
                    .contains(&data.transaction_id)
                {
                    Ok(Event::TransactionNoteUpdated(data))
                } else {
                    Err(DomainError::CommandRejected(
                        "The requested transaction ID is not found!".to_string(),
                    ))
                }
            },
        }
    }

    /// Construct the state from one event.
    pub fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::ImportTransactionsRequested(data) => {
                self.having_pending_requests = true;
                self.sessions_being_used_set.insert(data.session_id);
            },
            Event::TransactionImportRetryRequested(data) => {
                self.having_pending_requests = true;
                self.sessions_being_used_set.insert(data.session_id);
            },
            Event::ImportTransactionsCompleted(data) => {
                self.failed_request_id_set
                    .remove(&(data.request_id, data.session_id));

                self.sessions_being_used_set.remove(&data.session_id);
                if self.sessions_being_used_set.is_empty() {
                    self.having_pending_requests = false;
                }
            },
            Event::ImportTransactionsFailed(data) => {
                self.failed_request_id_set
                    .insert((data.request_id, data.session_id));

                self.sessions_being_used_set.remove(&data.session_id);
                if self.sessions_being_used_set.is_empty() {
                    self.having_pending_requests = false;
                }
            },
            Event::TransactionRecorded(data) => {
                self.recorded_transaction_id_set.insert(data.transaction_id);
            },
            Event::ImportTransactionsContinued(_)
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
    use std::vec;

    use uuid::Uuid;

    use super::CoreAggregate;
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

    /// Extract the request_id from an [`Event::ImportTransactionsRequested`] event.
    fn request_id_from_event(event: &Event) -> Uuid {
        match event {
            Event::ImportTransactionsRequested(data) => data.request_id,
            _ => panic!("expected ImportTransactionsRequested, got {event:?}"),
        }
    }

    /// Build an aggregate that has already seen the given request fail, so the
    /// request id is recorded in the failed-request set and is eligible for retry.
    fn aggregate_with_failed_request(request_id: Uuid, session_id: i64) -> CoreAggregate {
        CoreAggregate::new(&[
            Event::ImportTransactionsRequested(ImportRequestData {
                request_id,
                session_id,
                ..Default::default()
            }),
            Event::ImportTransactionsFailed(ImportStatusData {
                request_id,
                session_id,
            }),
        ])
    }

    #[test]
    fn execute_succeeds_with_no_pending_request() {
        let aggregate = CoreAggregate::new(&[]);
        let commands = Command::create_import_transactions(None, None, vec![1, 2]).unwrap();
        assert!(
            commands
                .into_iter()
                .all(|command| aggregate.execute(command).is_ok())
        );
    }

    #[test]
    fn execute_rejects_when_trying_to_use_overlapping_sessions() {
        let aggregate = CoreAggregate::new(&[]);
        let commands = Command::create_import_transactions(None, None, vec![1, 2]).unwrap();
        let events: Vec<Event> = commands
            .into_iter()
            .map(|c| aggregate.execute(c).unwrap())
            .collect();
        let aggregate = aggregate.multi_apply(&events);

        let commands = Command::create_import_transactions(None, None, vec![2, 3]).unwrap();
        let commands_accepted: Vec<bool> = commands
            .into_iter()
            .map(|c| aggregate.execute(c).is_ok())
            .collect();
        assert!(!commands_accepted.first().unwrap());
        assert!(commands_accepted.get(1).unwrap());
    }

    #[test]
    fn execute_rejects_command_with_invalid_dates() {
        let aggregate = CoreAggregate::new(&[]);
        let invalid_commands =
            Command::create_import_transactions(Some("2026-06-05"), Some("2026-06-01"), vec![1, 2])
                .unwrap();
        assert!(
            invalid_commands
                .into_iter()
                .all(|command| aggregate.execute(command).is_err())
        );

        let valid_command =
            Command::create_import_transactions(Some("2026-06-05"), Some("2026-06-05"), vec![1, 2])
                .unwrap();
        assert!(
            valid_command
                .into_iter()
                .all(|command| aggregate.execute(command).is_ok())
        );
    }

    #[test]
    fn apply_completed_event_clears_pending_request() {
        let aggregate = CoreAggregate::new(&[]);
        let commands = Command::create_import_transactions(None, None, vec![1, 2]).unwrap();
        let requested_events: Vec<Event> = commands
            .into_iter()
            .map(|command| aggregate.execute(command).unwrap())
            .collect();
        let request_id = request_id_from_event(requested_events.first().unwrap());
        let aggregate = aggregate.multi_apply(&requested_events);

        let completed = Event::ImportTransactionsCompleted(ImportStatusData {
            request_id,
            session_id: 1,
        });
        let aggregate = aggregate.apply(&completed);

        let commands = Command::create_import_transactions(None, None, vec![1, 2]).unwrap();
        let commands_accepted: Vec<bool> = commands
            .into_iter()
            .map(|c| aggregate.execute(c).is_ok())
            .collect();

        // Accepted command
        assert!(commands_accepted.first().unwrap());
        // Rejected command
        assert!(!commands_accepted.get(1).unwrap());
    }

    #[test]
    fn apply_failed_event_clears_pending_request() {
        let aggregate = CoreAggregate::new(&[]);
        let commands = Command::create_import_transactions(None, None, vec![1, 2]).unwrap();
        let requested_events: Vec<Event> = commands
            .into_iter()
            .map(|command| aggregate.execute(command).unwrap())
            .collect();
        let request_id = request_id_from_event(requested_events.first().unwrap());
        let aggregate = aggregate.multi_apply(&requested_events);

        let failed = Event::ImportTransactionsFailed(ImportStatusData {
            request_id,
            session_id: 1,
        });
        let aggregate = aggregate.apply(&failed);

        let commands = Command::create_import_transactions(None, None, vec![1, 2]).unwrap();
        let commands_accepted: Vec<bool> = commands
            .into_iter()
            .map(|c| aggregate.execute(c).is_ok())
            .collect();

        // Accepted command
        assert!(commands_accepted.first().unwrap());
        // Rejected command
        assert!(!commands_accepted.get(1).unwrap());
    }

    #[test]
    fn apply_mismatched_completed_event_keeps_request_pending() {
        let aggregate = CoreAggregate::new(&[]);
        let command = Command::create_import_transactions(None, None, vec![1])
            .unwrap()
            .into_iter()
            .next()
            .unwrap();
        let requested = aggregate.execute(command).unwrap();
        let aggregate = aggregate.apply(&requested);

        // A completed event for a different session should not unblock the aggregate.
        let completed = Event::ImportTransactionsCompleted(ImportStatusData {
            request_id: Uuid::new_v4(),
            session_id: 2,
        });
        let aggregate = aggregate.apply(&completed);

        let command = Command::create_import_transactions(None, None, vec![1])
            .unwrap()
            .into_iter()
            .next()
            .unwrap();
        assert!(aggregate.execute(command).is_err());
    }

    #[test]
    fn execute_retry_succeeds_for_known_failed_request() {
        let request_id = Uuid::new_v4();
        let session_id = 1;

        let aggregate = aggregate_with_failed_request(request_id, session_id);

        let command =
            Command::create_retry_failed_import_request(&request_id.to_string(), session_id)
                .unwrap();
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
            Command::create_retry_failed_import_request(&Uuid::new_v4().to_string(), 1).unwrap();
        assert!(aggregate.execute(command).is_err());
    }

    #[test]
    fn execute_retry_rejects_when_pending_request_exists() {
        let request_id = Uuid::new_v4();
        // Record the failure, then start a fresh import so a request is pending again.
        let aggregate = aggregate_with_failed_request(request_id, 1);
        let pending = Command::create_import_transactions(None, None, vec![1])
            .unwrap()
            .into_iter()
            .next()
            .unwrap();
        let requested = aggregate.execute(pending).unwrap();
        let aggregate = aggregate.apply(&requested);

        let retry =
            Command::create_retry_failed_import_request(&request_id.to_string(), 2).unwrap();
        assert!(aggregate.execute(retry).is_err());
    }

    #[test]
    fn apply_retry_requested_blocks_new_requests_with_same_sessions() {
        let request_id = Uuid::new_v4();
        // A retry-requested event marks a request as pending again.
        let aggregate =
            CoreAggregate::new(&[Event::TransactionImportRetryRequested(ImportStatusData {
                request_id,
                session_id: 1,
            })]);

        let commands = Command::create_import_transactions(None, None, vec![1, 2]).unwrap();
        let commands_accepted: Vec<bool> = commands
            .into_iter()
            .map(|c| aggregate.execute(c).is_ok())
            .collect();

        // Rejected command
        assert!(!commands_accepted.first().unwrap());
        // Accepted command
        assert!(commands_accepted.get(1).unwrap());
    }

    #[test]
    fn failed_event_makes_request_eligible_for_retry() {
        let aggregate = CoreAggregate::new(&[]);
        let commands = Command::create_import_transactions(None, None, vec![1, 2]).unwrap();

        let requested_events: Vec<Event> = commands
            .into_iter()
            .map(|command| aggregate.execute(command).unwrap())
            .collect();
        let request_id_1 = request_id_from_event(requested_events.first().unwrap());
        let request_id_2 = request_id_from_event(requested_events.get(1).unwrap());

        let aggregate = aggregate.multi_apply(&requested_events);

        // Failing the pending request both clears it and records it as retryable.
        let failed = Event::ImportTransactionsFailed(ImportStatusData {
            request_id: request_id_1,
            session_id: 1,
        });
        let aggregate = aggregate.apply(&failed);

        let succeeded = Event::ImportTransactionsCompleted(ImportStatusData {
            request_id: request_id_2,
            session_id: 2,
        });
        let aggregate = aggregate.apply(&succeeded);

        let retry =
            Command::create_retry_failed_import_request(&request_id_1.to_string(), 1).unwrap();
        assert!(aggregate.execute(retry).is_ok());

        let retry2 =
            Command::create_retry_failed_import_request(&request_id_2.to_string(), 2).unwrap();
        assert!(aggregate.execute(retry2).is_err());
    }

    #[test]
    fn multi_apply_handles_full_request_lifecycle() {
        let aggregate = CoreAggregate::new(&[]);
        let command = Command::create_import_transactions(None, None, vec![1])
            .unwrap()
            .into_iter()
            .next()
            .unwrap();
        let requested = aggregate.execute(command).unwrap();
        let request_id = request_id_from_event(&requested);
        let completed = Event::ImportTransactionsCompleted(ImportStatusData {
            request_id,
            session_id: 1,
        });

        let aggregate = CoreAggregate::new(&[]).multi_apply(&[requested, completed]);

        let command = Command::create_import_transactions(None, None, vec![1])
            .unwrap()
            .into_iter()
            .next()
            .unwrap();
        assert!(aggregate.execute(command).is_ok());
    }

    /// Build a minimal [`TransactionData`] suitable for aggregate tests.
    fn samples_transaction_data(
        transaction_id: Uuid,
    ) -> crate::events::transactions::TransactionData {
        crate::events::transactions::TransactionData {
            transaction_id,
            booking_date: None,
            transaction_date: None,
            amount: 10.0,
            currency: "EUR".into(),
            creditor_name: None,
            debtor_name: None,
        }
    }

    /// Execute a [`Command::CategorizeTransaction`] against the aggregate.
    fn exec_categorize(
        aggregate: &CoreAggregate,
        txn_id: Uuid,
        cat: crate::shared_schema::TransactionCategory,
    ) -> Result<Event, DomainError> {
        aggregate.execute(Command::CategorizeTransaction(
            crate::shared_schema::TransactionCategoryData {
                transaction_id: txn_id,
                category: cat,
            },
        ))
    }

    /// Execute a [`Command::ClassifyTransaction`] against the aggregate.
    fn exec_classify(
        aggregate: &CoreAggregate,
        txn_id: Uuid,
        cls: crate::shared_schema::TransactionClassification,
    ) -> Result<Event, DomainError> {
        aggregate.execute(Command::ClassifyTransaction(
            crate::shared_schema::TransactionClassificationData {
                transaction_id: txn_id,
                classification: cls,
            },
        ))
    }

    /// Categorize succeeds only after the transaction has been recorded.
    #[test]
    fn execute_categorize_succeeds_for_recorded_transaction() {
        let txn_id = Uuid::new_v4();
        let aggregate =
            CoreAggregate::new(&[Event::TransactionRecorded(samples_transaction_data(txn_id))]);
        let event = exec_categorize(
            &aggregate,
            txn_id,
            crate::shared_schema::TransactionCategory::Groceries,
        )
        .unwrap();
        assert!(matches!(event, Event::TransactionCategorized(_)));
    }

    /// Categorize rejects transaction ids that are not in the recorded set.
    #[test]
    fn execute_categorize_rejects_unknown_transaction() {
        let aggregate = CoreAggregate::new(&[]);
        assert!(
            exec_categorize(
                &aggregate,
                Uuid::new_v4(),
                crate::shared_schema::TransactionCategory::Groceries
            )
            .is_err()
        );
    }

    /// Classify succeeds only after the transaction has been recorded.
    #[test]
    fn execute_classify_succeeds_for_recorded_transaction() {
        let txn_id = Uuid::new_v4();
        let aggregate =
            CoreAggregate::new(&[Event::TransactionRecorded(samples_transaction_data(txn_id))]);
        let event = exec_classify(
            &aggregate,
            txn_id,
            crate::shared_schema::TransactionClassification::MustHave,
        )
        .unwrap();
        assert!(matches!(event, Event::TransactionClassified(_)));
    }

    /// Classify rejects transaction ids that are not in the recorded set.
    #[test]
    fn execute_classify_rejects_unknown_transaction() {
        let aggregate = CoreAggregate::new(&[]);
        assert!(
            exec_classify(
                &aggregate,
                Uuid::new_v4(),
                crate::shared_schema::TransactionClassification::MustHave
            )
            .is_err()
        );
    }

    /// Updating a note succeeds only after the transaction has been recorded.
    #[test]
    fn execute_update_note_succeeds_for_recorded_transaction() {
        let txn_id = Uuid::new_v4();
        let aggregate =
            CoreAggregate::new(&[Event::TransactionRecorded(samples_transaction_data(txn_id))]);
        let cmd = Command::UpdateTransactionNote(crate::shared_schema::TransactionNoteData {
            transaction_id: txn_id,
            note: "hello".into(),
        });
        let event = aggregate.execute(cmd).unwrap();
        assert!(matches!(event, Event::TransactionNoteUpdated(_)));
    }

    /// Updating a note rejects transaction ids that are not in the recorded set.
    #[test]
    fn execute_update_note_rejects_unknown_transaction() {
        let aggregate = CoreAggregate::new(&[]);
        let cmd = Command::UpdateTransactionNote(crate::shared_schema::TransactionNoteData {
            transaction_id: Uuid::new_v4(),
            note: "hello".into(),
        });
        assert!(aggregate.execute(cmd).is_err());
    }

    /// Categorize, classify, and note-updated events do not alter aggregate state.
    #[test]
    fn apply_annotation_events_does_not_change_recorded_or_pending_state() {
        let txn_id = Uuid::new_v4();
        let aggregate =
            CoreAggregate::new(&[Event::TransactionRecorded(samples_transaction_data(txn_id))]);
        // Apply annotation events — these must not change the recorded set.
        let aggregate = aggregate
            .apply(&Event::TransactionCategorized(
                crate::shared_schema::TransactionCategoryData {
                    transaction_id: txn_id,
                    category: crate::shared_schema::TransactionCategory::Groceries,
                },
            ))
            .apply(&Event::TransactionClassified(
                crate::shared_schema::TransactionClassificationData {
                    transaction_id: txn_id,
                    classification: crate::shared_schema::TransactionClassification::MustHave,
                },
            ))
            .apply(&Event::TransactionNoteUpdated(
                crate::shared_schema::TransactionNoteData {
                    transaction_id: txn_id,
                    note: "hello".into(),
                },
            ));
        // The transaction is still recorded, so a new categorization for it should still succeed.
        assert!(
            exec_categorize(
                &aggregate,
                txn_id,
                crate::shared_schema::TransactionCategory::Health
            )
            .is_ok()
        );
    }
}
