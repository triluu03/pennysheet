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
    /// ID of the current Enable Banking session.
    session_id: i64,
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
    ///
    /// Returns [`DomainError`] if there's no pending transaction import request.
    pub fn new(session_id: i64, all_events: &[Event]) -> Result<Self, DomainError> {
        let new_self = Self {
            session_id,
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
    ///
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
                if self.session_id == data.session_id {
                    self.pending_request_id = Some(data.request_id);
                    self.pending_request_data = Some(RequestData {
                        start_date: data.start_date,
                        end_date: data.end_date,
                        continuation_key: None,
                    });
                }
            },
            Event::ImportTransactionsContinued(data) => {
                if self.session_id == data.session_id
                    && self.pending_request_id == Some(data.request_id)
                {
                    self.pending_request_data = Some(RequestData {
                        start_date: data.start_date,
                        end_date: data.end_date,
                        continuation_key: Some(data.continuation_key.clone()),
                    })
                }
            },
            Event::ImportTransactionsCompleted(data) => {
                if self.session_id == data.session_id
                    && self.pending_request_id == Some(data.request_id)
                {
                    if let Some(request_id) = self.pending_request_id {
                        self.failed_request_map.remove(&request_id);
                    };

                    self.pending_request_id = None;
                    self.pending_request_data = None;
                }
            },
            Event::ImportTransactionsFailed(data) => {
                if self.session_id == data.session_id
                    && self.pending_request_id == Some(data.request_id)
                {
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
                if self.session_id == data.session_id
                    && let Some(request_data) = self.failed_request_map.get(&data.request_id)
                {
                    self.pending_request_id = Some(data.request_id);
                    self.pending_request_data = Some(request_data.to_owned());
                };
            },
            Event::TransactionRecorded(_)
            | Event::TransactionCategorized(_)
            | Event::TransactionClassified(_)
            | Event::TransactionNoteUpdated(_) => {
                // Ignore these transaction events
            },
            Event::BudgetCreated(_)
            | Event::BudgetUpdated(_)
            | Event::BudgetDeleted(_)
            | Event::BudgetExceeded(_)
            | Event::BudgetReset(_) => {
                // Ignore all budget events.
            },
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

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;
    use gateway::schema::enable_banking_api::transaction::TransactionQueryParameters;
    use uuid::Uuid;

    use super::TransactionProcessManager;
    use crate::{
        commands::GatewayCommand,
        errors::DomainError,
        events::{
            Event,
            transactions::{
                ImportContinueData,
                ImportRequestData,
                ImportStatusData,
            },
        },
    };

    /// Fixture start date for the original import request.
    fn start_date() -> NaiveDate {
        NaiveDate::from_ymd_opt(2026, 6, 1).expect("hard-coded test date is valid")
    }

    /// Fixture end date for the original import request.
    fn end_date() -> NaiveDate {
        NaiveDate::from_ymd_opt(2026, 6, 30).expect("hard-coded test date is valid")
    }

    /// Build an `ImportTransactionsRequested` event with a known request id and date range.
    fn requested_event(request_id: Uuid, session_id: i64) -> Event {
        Event::ImportTransactionsRequested(ImportRequestData {
            request_id,
            start_date: start_date(),
            end_date: end_date(),
            session_id,
        })
    }

    /// Unwrap the manager's gateway command into its query parameters, failing the test otherwise.
    fn expect_query_params(manager: &TransactionProcessManager) -> TransactionQueryParameters {
        match manager.create_gateway_command() {
            Ok(GatewayCommand::ImportTransactions(params)) => params,
            Err(error) => panic!("expected a gateway command, got error: {error:?}"),
        }
    }

    #[test]
    fn new_fails_without_pending_request() {
        let result = TransactionProcessManager::new(1, &[]);
        assert!(matches!(result, Err(DomainError::ComponentInit(_))));

        let result = TransactionProcessManager::new(2, &[requested_event(Uuid::new_v4(), 1)]);
        assert!(matches!(result, Err(DomainError::ComponentInit(_))));
    }

    #[test]
    fn new_succeeds_with_pending_request() {
        assert!(TransactionProcessManager::new(1, &[requested_event(Uuid::new_v4(), 1)]).is_ok());
    }

    #[test]
    fn new_fails_after_request_completed() {
        let request_id = Uuid::new_v4();
        let events = [
            requested_event(request_id, 1),
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id,
                session_id: 1,
            }),
        ];
        assert!(matches!(
            TransactionProcessManager::new(1, &events),
            Err(DomainError::ComponentInit(_))
        ));
        assert!(matches!(
            TransactionProcessManager::new(2, &events),
            Err(DomainError::ComponentInit(_))
        ));
    }

    #[test]
    fn new_ignores_completion_for_a_different_request() {
        let request_id = Uuid::new_v4();
        let events = [
            requested_event(request_id, 1),
            // A completion for an unrelated request must not clear our pending state.
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id: Uuid::new_v4(),
                session_id: 1,
            }),
            // A completion for an unrelated request must not clear our pending state.
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id,
                session_id: 2,
            }),
        ];
        assert!(TransactionProcessManager::new(1, &events).is_ok());
    }

    #[test]
    fn gateway_command_uses_pending_request_dates() {
        let manager =
            TransactionProcessManager::new(1, &[requested_event(Uuid::new_v4(), 1)]).unwrap();
        let params = expect_query_params(&manager);

        assert_eq!(params.date_from, Some(start_date().to_string()));
        assert_eq!(params.date_to, Some(end_date().to_string()));
        // A fresh request has not paginated yet, so there is no continuation key.
        assert_eq!(params.continuation_key, None);
    }

    #[test]
    fn gateway_command_fails_when_no_pending_request() {
        let request_id = Uuid::new_v4();
        let session_id = 1;

        let manager =
            TransactionProcessManager::new(session_id, &[requested_event(request_id, session_id)])
                .unwrap();

        // Completing the pending request leaves the manager with nothing to import.
        let manager = manager.apply(&Event::ImportTransactionsCompleted(ImportStatusData {
            request_id,
            session_id,
        }));
        assert!(matches!(
            manager.create_gateway_command(),
            Err(DomainError::CommandCreation(_))
        ));
    }

    #[test]
    fn continuation_advances_dates_and_carries_continuation_key() {
        let request_id = Uuid::new_v4();
        let session_id = 1;

        let continued_start = NaiveDate::from_ymd_opt(2026, 6, 10).expect("valid test date");
        let continued_end = NaiveDate::from_ymd_opt(2026, 6, 20).expect("valid test date");
        let manager = TransactionProcessManager::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                Event::ImportTransactionsContinued(ImportContinueData {
                    request_id,
                    session_id,
                    start_date: continued_start,
                    end_date: continued_end,
                    continuation_key: "next-page".to_string(),
                }),
            ],
        )
        .unwrap();

        let params = expect_query_params(&manager);
        // A continuation advances the date window and forwards the continuation key,
        // so the next gateway call resumes pagination from where it left off.
        assert_eq!(params.date_from, Some(continued_start.to_string()));
        assert_eq!(params.date_to, Some(continued_end.to_string()));
        assert_eq!(params.continuation_key, Some("next-page".to_string()));
    }

    #[test]
    fn continuation_for_a_different_request_is_ignored() {
        let request_id = Uuid::new_v4();
        let session_id = 1;

        let manager = TransactionProcessManager::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                // A continuation belonging to another request must not alter our state.
                Event::ImportTransactionsContinued(ImportContinueData {
                    request_id: Uuid::new_v4(),
                    session_id,
                    start_date: NaiveDate::from_ymd_opt(2020, 1, 1).expect("valid test date"),
                    end_date: NaiveDate::from_ymd_opt(2020, 1, 2).expect("valid test date"),
                    continuation_key: "unrelated".to_string(),
                }),
            ],
        )
        .unwrap();

        let params = expect_query_params(&manager);
        assert_eq!(params.date_from, Some(start_date().to_string()));
        assert_eq!(params.date_to, Some(end_date().to_string()));
        assert_eq!(params.continuation_key, None);
    }

    #[test]
    fn retry_after_failure_restores_original_request() {
        let request_id = Uuid::new_v4();
        let session_id = 1;

        // The original request fails and is then retried; the manager must become
        // pending on the original request id again with its original date range.
        let manager = TransactionProcessManager::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                Event::ImportTransactionsFailed(ImportStatusData {
                    request_id,
                    session_id,
                }),
                Event::TransactionImportRetryRequested(ImportStatusData {
                    request_id,
                    session_id,
                }),
            ],
        )
        .expect("a retried request should re-initialize the manager");

        let params = expect_query_params(&manager);
        assert_eq!(params.date_from, Some(start_date().to_string()));
        assert_eq!(params.date_to, Some(end_date().to_string()));
    }

    #[test]
    fn retry_for_unknown_request_does_not_establish_pending() {
        // A retry event with no preceding failure references an unknown request,
        // so it must not establish a pending request and the manager stays uninitialized.
        let events = [Event::TransactionImportRetryRequested(ImportStatusData {
            request_id: Uuid::new_v4(),
            session_id: 1,
        })];
        assert!(matches!(
            TransactionProcessManager::new(1, &events),
            Err(DomainError::ComponentInit(_))
        ));
    }

    #[test]
    fn completion_makes_request_ineligible_for_later_retry() {
        let request_id = Uuid::new_v4();
        let session_id = 1;

        // Failing records the request as retryable, a retry restores it, and the
        // subsequent completion must drop it from the failed-request map. A further
        // retry then references an unknown request and cannot restore a pending one.
        let events = [
            requested_event(request_id, session_id),
            Event::ImportTransactionsFailed(ImportStatusData {
                request_id,
                session_id,
            }),
            Event::TransactionImportRetryRequested(ImportStatusData {
                request_id,
                session_id,
            }),
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id,
                session_id,
            }),
            Event::TransactionImportRetryRequested(ImportStatusData {
                request_id,
                session_id,
            }),
        ];
        assert!(matches!(
            TransactionProcessManager::new(session_id, &events),
            Err(DomainError::ComponentInit(_))
        ));
    }

    #[test]
    fn transaction_recorded_events_do_not_affect_pending_request() {
        use gateway::schema::enable_banking_api::{
            AmountType,
            transaction::{
                PartyIdentification,
                Transaction,
            },
        };

        use crate::events::transactions::TransactionData;

        let request_id = Uuid::new_v4();
        let session_id = 1;
        // Recorded transactions are irrelevant to the process manager's pending
        // state, so the manager must remain pending on the original request.
        let recorded = TransactionData::new(Transaction {
            transaction_amount: AmountType {
                currency: "EUR".to_string(),
                amount: "10.00".to_string(),
            },
            creditor: Some(PartyIdentification {
                name: Some("Acme Corp".to_string()),
            }),
            debtor: None,
            booking_date: Some("2026-06-15".to_string()),
            transaction_date: Some("2026-06-14".to_string()),
        })
        .expect("a valid transaction yields transaction data");
        let manager = TransactionProcessManager::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                Event::TransactionRecorded(recorded),
            ],
        )
        .expect("recorded transactions must not clear the pending request");

        let params = expect_query_params(&manager);
        assert_eq!(params.date_from, Some(start_date().to_string()));
        assert_eq!(params.date_to, Some(end_date().to_string()));
    }
}
