//! Event injectors.

use chrono::NaiveDate;
use gateway::schema::enable_banking_api::transaction::TransactionResponse;
use std::collections::{
    HashMap,
    HashSet,
};
use uuid::Uuid;

use crate::{
    errors::DomainError,
    events::{
        Event,
        transactions::{
            ImportContinueData,
            ImportStatusData,
            TransactionData,
        },
    },
};

#[derive(Default, Debug)]
pub struct EventInjector {
    /// ID of the current pending request.
    pending_request_id: Option<Uuid>,
    /// Data of the current pending request.
    pending_request_data: Option<RequestData>,
    /// Map of all failed import requests with request ID as keys
    /// and [`RequestData`] as values.
    failed_request_map: HashMap<Uuid, RequestData>,
    /// Set of UUIDs for recorded transactions. This is used to avoid duplication when injecting
    /// new transaction events into the event table.
    recorded_transaction_id_set: HashSet<Uuid>,
}

#[derive(Default, Debug, Clone)]
struct RequestData {
    start_date: NaiveDate,
    end_date: NaiveDate,
}

impl EventInjector {
    /// Construct a [`EventInjector`] from the current event table.
    ///
    /// # Errors
    /// Returns [`DomainError`] if there's no pending transaction import request
    /// found in the event table.
    pub fn new(all_events: &[Event]) -> Result<Self, DomainError> {
        let new_self = Self {
            ..Default::default()
        }
        .multi_apply(all_events);

        match new_self.pending_request_id {
            None => Err(DomainError::ComponentInit(
                "no pending request ID to initialize event injector with".to_string(),
            )),
            Some(_) => Ok(new_self),
        }
    }

    /// Inject transaction events.
    ///
    /// # Errors
    /// Returns [`DomainError`] if the state of the [`EventInjector`] has been corrupted.
    pub fn inject_transaction_events(
        &self,
        response: TransactionResponse,
    ) -> Result<Vec<Event>, DomainError> {
        let new_data_records: Vec<TransactionData> = response
            .transactions
            .into_iter()
            .map(TransactionData::new)
            .collect::<Result<Vec<TransactionData>, DomainError>>()?;

        let mut new_events: Vec<Event> = new_data_records
            .into_iter()
            .filter_map(|data| {
                if self
                    .recorded_transaction_id_set
                    .contains(data.get_transaction_id())
                {
                    None
                } else {
                    Some(Event::TransactionRecorded(data))
                }
            })
            .collect();

        if let Some(continuation_key) = response.continuation_key {
            let request_id = self.pending_request_id.ok_or_else(|| {
                DomainError::EventCreation(
                    "corrupted state of event injector: pending_request_id".to_string(),
                )
            })?;
            let request_data = self.pending_request_data.as_ref().ok_or_else(|| {
                DomainError::EventCreation(
                    "corrupted state of event injector: pending_request_data".to_string(),
                )
            })?;

            new_events.push(Event::ImportTransactionsContinued(ImportContinueData {
                request_id,
                start_date: request_data.start_date,
                end_date: request_data.end_date,
                continuation_key,
            }));
        } else {
            new_events.push(Event::ImportTransactionsCompleted(ImportStatusData {
                request_id: self.pending_request_id.ok_or_else(|| {
                    DomainError::EventCreation(
                        "corrupted state of event injector: request_id".to_string(),
                    )
                })?,
            }));
        }

        Ok(new_events)
    }

    /// Construct the state from one event.
    pub fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::ImportTransactionsRequested(data) => {
                self.pending_request_id = Some(data.request_id);
                self.pending_request_data = Some(RequestData {
                    start_date: data.start_date,
                    end_date: data.end_date,
                })
            },
            Event::TransactionImportRetryRequested(data) => {
                if let Some(request_data) = self.failed_request_map.get(&data.request_id) {
                    self.pending_request_id = Some(data.request_id);
                    self.pending_request_data = Some(request_data.to_owned());
                };
            },
            Event::TransactionRecorded(data) => {
                self.recorded_transaction_id_set
                    .insert(*data.get_transaction_id());
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
            Event::ImportTransactionsContinued(data) => {
                if self.pending_request_id == Some(data.request_id) {
                    self.pending_request_data = Some(RequestData {
                        start_date: data.start_date,
                        end_date: data.end_date,
                    })
                }
            },
        }
        self
    }

    /// Construct the state from multiple events (in order).
    pub fn multi_apply(self, events: &[Event]) -> Self {
        events
            .iter()
            .fold(self, |injector, event| injector.apply(event))
    }
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;
    use gateway::schema::enable_banking_api::{
        AmountType,
        transaction::{
            PartyIdentification,
            Transaction,
            TransactionResponse,
        },
    };
    use uuid::Uuid;

    use super::EventInjector;
    use crate::{
        errors::DomainError,
        events::{
            Event,
            transactions::{
                ImportRequestData,
                ImportStatusData,
                TransactionData,
            },
        },
    };

    /// Fixture start date
    fn start_date() -> NaiveDate {
        NaiveDate::from_ymd_opt(2026, 6, 1).expect("hard-coded test date is valid")
    }

    /// Fixture end date
    fn end_date() -> NaiveDate {
        NaiveDate::from_ymd_opt(2026, 6, 30).expect("hard-coded test date is valid")
    }

    /// Build an `ImportTransactionsRequested` event with a known request id and date range.
    fn requested_event(request_id: Uuid) -> Event {
        Event::ImportTransactionsRequested(ImportRequestData {
            request_id,
            start_date: start_date(),
            end_date: end_date(),
        })
    }

    /// Build an injector already holding a pending request, ready to inject events.
    fn pending_injector(request_id: Uuid) -> EventInjector {
        EventInjector::new(&[requested_event(request_id)])
            .expect("a pending request should initialize the injector")
    }

    /// Build a gateway `Transaction` with the given amount; remaining fields are fixed and valid.
    fn transaction_with_amount(amount: &str) -> Transaction {
        Transaction {
            transaction_amount: AmountType {
                currency: "EUR".to_string(),
                amount: amount.to_string(),
            },
            creditor: Some(PartyIdentification {
                name: Some("Acme Corp".to_string()),
            }),
            debtor: None,
            booking_date: Some("2026-06-15".to_string()),
            transaction_date: Some("2026-06-14".to_string()),
        }
    }

    #[test]
    fn new_fails_without_pending_request() {
        let result = EventInjector::new(&[]);
        assert!(matches!(result, Err(DomainError::ComponentInit(_))));
    }

    #[test]
    fn new_fails_after_request_completed() {
        let request_id = Uuid::new_v4();
        let events = [
            requested_event(request_id),
            Event::ImportTransactionsCompleted(ImportStatusData { request_id }),
        ];
        let result = EventInjector::new(&events);
        assert!(matches!(result, Err(DomainError::ComponentInit(_))));
    }

    #[test]
    fn new_ignores_completion_for_a_different_request() {
        let request_id = Uuid::new_v4();
        let events = [
            requested_event(request_id),
            // A completion for an unrelated request must not clear our pending state.
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id: Uuid::new_v4(),
            }),
        ];
        assert!(EventInjector::new(&events).is_ok());
    }

    #[test]
    fn new_succeeds_with_pending_request() {
        assert!(EventInjector::new(&[requested_event(Uuid::new_v4())]).is_ok());
    }

    #[test]
    fn new_fails_with_retry_for_unknown_request() {
        let request_id = Uuid::new_v4();
        let events = [Event::TransactionImportRetryRequested(ImportStatusData {
            request_id,
        })];
        assert!(matches!(
            EventInjector::new(&events),
            Err(DomainError::ComponentInit(_))
        ));
    }

    #[test]
    fn retry_after_failure_restores_pending_request() {
        // Replaying a request that failed and was then retried must leave the
        // injector pending on the original request id again.
        let request_id = Uuid::new_v4();
        let injector = EventInjector::new(&[
            requested_event(request_id),
            Event::ImportTransactionsFailed(ImportStatusData { request_id }),
            Event::TransactionImportRetryRequested(ImportStatusData { request_id }),
        ])
        .expect("a retried request should re-initialize the injector");

        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("10.00")],
            continuation_key: None,
        };
        let events = injector.inject_transaction_events(response).unwrap();

        assert!(matches!(
            events.last(),
            Some(Event::ImportTransactionsCompleted(data)) if data.request_id == request_id
        ));
    }

    /// Build a `TransactionRecorded` event for the given transaction, mirroring how a
    /// previously injected transaction would appear in the event history.
    fn recorded_event(transaction: Transaction) -> Event {
        Event::TransactionRecorded(
            TransactionData::new(transaction).expect("fixture transaction has valid fields"),
        )
    }

    /// Count the `TransactionRecorded` events emitted in an injection result.
    fn recorded_count(events: &[Event]) -> usize {
        events
            .iter()
            .filter(|event| matches!(event, Event::TransactionRecorded(_)))
            .count()
    }

    #[test]
    fn inject_skips_transaction_already_recorded_in_history() {
        let request_id = Uuid::new_v4();
        // The event history already contains this exact transaction as a recorded event.
        let injector = EventInjector::new(&[
            requested_event(request_id),
            recorded_event(transaction_with_amount("12.34")),
        ])
        .expect("a pending request should initialize the injector");

        // The incoming batch re-delivers the same transaction (same content => same id).
        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("12.34")],
            continuation_key: None,
        };

        let events = injector.inject_transaction_events(response).unwrap();

        // The duplicate is filtered out; only the terminal completion event remains.
        assert_eq!(recorded_count(&events), 0);
        assert!(matches!(
            events.last(),
            Some(Event::ImportTransactionsCompleted(data)) if data.request_id == request_id
        ));
    }

    #[test]
    fn inject_emits_only_transactions_not_already_recorded() {
        let request_id = Uuid::new_v4();
        let injector = EventInjector::new(&[
            requested_event(request_id),
            recorded_event(transaction_with_amount("12.34")),
        ])
        .expect("a pending request should initialize the injector");

        // One transaction duplicates history, the other is brand new.
        let response = TransactionResponse {
            transactions: vec![
                transaction_with_amount("12.34"),
                transaction_with_amount("56.78"),
            ],
            continuation_key: None,
        };

        let events = injector.inject_transaction_events(response).unwrap();

        // Only the new transaction survives the dedup filter.
        let recorded: Vec<&Event> = events
            .iter()
            .filter(|event| matches!(event, Event::TransactionRecorded(_)))
            .collect();
        assert_eq!(recorded.len(), 1);
        match recorded[0] {
            Event::TransactionRecorded(data) => assert_eq!(format!("{:.2}", data.amount), "56.78"),
            other => panic!("expected TransactionRecorded, got {other:?}"),
        }
    }

    #[test]
    fn inject_records_all_transactions_and_completes_without_continuation() {
        let request_id = Uuid::new_v4();
        let injector = pending_injector(request_id);

        let response = TransactionResponse {
            transactions: vec![
                transaction_with_amount("12.34"),
                transaction_with_amount("56.78"),
            ],
            continuation_key: None,
        };

        let events = injector.inject_transaction_events(response).unwrap();

        // Both transactions are recorded (none dropped) plus a single terminal completion event.
        let recorded = events
            .iter()
            .filter(|event| matches!(event, Event::TransactionRecorded(_)))
            .count();
        assert_eq!(recorded, 2);
        assert!(matches!(
            events.last(),
            Some(Event::ImportTransactionsCompleted(data)) if data.request_id == request_id
        ));
    }

    #[test]
    fn inject_emits_continuation_event_when_continuation_key_present() {
        let request_id = Uuid::new_v4();
        let injector = pending_injector(request_id);

        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("10.00")],
            continuation_key: Some("next-page".to_string()),
        };

        let events = injector.inject_transaction_events(response).unwrap();

        // The continuation event must carry the request id, date range, and key forward
        // so the next pagination round can resume from where this one left off.
        match events.last() {
            Some(Event::ImportTransactionsContinued(data)) => {
                assert_eq!(data.request_id, request_id);
                assert_eq!(data.start_date, start_date());
                assert_eq!(data.end_date, end_date());
                assert_eq!(data.continuation_key, "next-page");
            },
            other => panic!("expected ImportTransactionsContinued, got {other:?}"),
        }
    }

    #[test]
    fn inject_maps_gateway_transaction_fields_to_event() {
        let injector = pending_injector(Uuid::new_v4());

        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("99.95")],
            continuation_key: None,
        };

        let events = injector.inject_transaction_events(response).unwrap();
        match &events[0] {
            Event::TransactionRecorded(data) => {
                // Compare the amount via formatting to avoid brittle float equality.
                assert_eq!(format!("{:.2}", data.amount), "99.95");
                assert_eq!(data.currency, "EUR");
                assert_eq!(data.booking_date, NaiveDate::from_ymd_opt(2026, 6, 15));
                assert_eq!(data.transaction_date, NaiveDate::from_ymd_opt(2026, 6, 14));
                assert_eq!(data.creditor_name.as_deref(), Some("Acme Corp"));
                assert_eq!(data.debtor_name, None);
            },
            other => panic!("expected TransactionRecorded, got {other:?}"),
        }
    }

    #[test]
    fn inject_fails_instead_of_dropping_transaction_with_invalid_amount() {
        let injector = pending_injector(Uuid::new_v4());

        // A batch with one good and one un-parseable amount must fail the whole injection
        // rather than silently dropping the bad transaction.
        let response = TransactionResponse {
            transactions: vec![
                transaction_with_amount("12.34"),
                transaction_with_amount("not-a-number"),
            ],
            continuation_key: None,
        };

        let result = injector.inject_transaction_events(response);
        assert!(matches!(result, Err(DomainError::EventCreation(_))));
    }

    #[test]
    fn inject_fails_instead_of_dropping_transaction_with_invalid_date() {
        let injector = pending_injector(Uuid::new_v4());

        let mut transaction = transaction_with_amount("12.34");
        transaction.booking_date = Some("2026-13-40".to_string());

        // An unparseable date is surfaced as an error rather than dropped.
        let response = TransactionResponse {
            transactions: vec![transaction],
            continuation_key: None,
        };

        assert!(injector.inject_transaction_events(response).is_err());
    }
}
