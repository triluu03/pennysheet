//! Event injectors.

use chrono::NaiveDate;
use gateway::schema::enable_banking_api::transaction::TransactionResponse;
use std::collections::HashSet;
use tracing::info;
use uuid::Uuid;

use crate::{
    errors::DomainError,
    events::{
        Event,
        budgets::{
            BudgetData,
            BudgetType,
            TrackedExpenseData,
        },
        transactions::{
            ImportContinueData,
            ImportStatusData,
            TransactionData,
        },
    },
};

/// Reconstructs import state and qualifies newly imported transactions for budget tracking.
#[derive(Default, Debug)]
pub struct EventInjector {
    /// ID of the current Enable Banking session.
    session_id: i64,
    /// ID of the current pending request.
    pending_request_id: Option<Uuid>,
    /// Data of the current pending request.
    pending_request_data: Option<RequestData>,
    /// Set of UUIDs for recorded transactions. This is used to avoid duplication when injecting
    /// new transaction events into the event table.
    recorded_transaction_id_set: HashSet<Uuid>,
    /// Active weekly budget data.
    weekly_budget: Option<BudgetData>,
    /// Active monthly budget data.
    monthly_budget: Option<BudgetData>,
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
    ///
    /// Returns [`DomainError`] if there's no pending transaction import request
    /// found in the event table.
    pub fn new(session_id: i64, all_events: &[Event]) -> Result<Self, DomainError> {
        let new_self = Self {
            session_id,
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

    /// Inject transaction-recorded and qualifying budget-expense events.
    ///
    /// Each new transaction is emitted as `TransactionRecorded` and may be followed by one
    /// `BudgetExpenseTracked` event per active budget type. Duplicate transactions are skipped.
    ///
    /// # Errors
    ///
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
            .filter(|data| {
                !self
                    .recorded_transaction_id_set
                    .contains(&data.transaction_id)
            })
            .flat_map(|data| {
                let mut events = Vec::with_capacity(3);

                // Create normal transaction recorded event.
                events.push(Event::TransactionRecorded(data.clone()));

                // Create bucket tracked events.
                if let Some(budget) = self.weekly_budget
                    && data.amount <= budget.threshold
                    && data
                        .booking_date
                        .is_some_and(|booking_date| booking_date >= budget.start_date)
                    && let Some(tracked) =
                        TrackedExpenseData::from_transaction(&data, BudgetType::Weekly)
                {
                    events.push(Event::BudgetExpenseTracked(tracked));
                }

                if let Some(budget) = self.monthly_budget
                    && data.amount <= budget.threshold
                    && data
                        .booking_date
                        .is_some_and(|booking_date| booking_date >= budget.start_date)
                    && let Some(tracked) =
                        TrackedExpenseData::from_transaction(&data, BudgetType::Monthly)
                {
                    events.push(Event::BudgetExpenseTracked(tracked));
                }

                events
            })
            .collect();

        let recorded_count = new_events.len();

        let terminal = if let Some(continuation_key) = response.continuation_key {
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

            Event::ImportTransactionsContinued(ImportContinueData {
                request_id,
                session_id: self.session_id,
                start_date: request_data.start_date,
                end_date: request_data.end_date,
                continuation_key,
            })
        } else {
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id: self.pending_request_id.ok_or_else(|| {
                    DomainError::EventCreation(
                        "corrupted state of event injector: request_id".to_string(),
                    )
                })?,
                session_id: self.session_id,
            })
        };

        info!(
            session_id = self.session_id,
            request_id = ?self.pending_request_id,
            recorded_count,
            terminal = %terminal,
            "injected transaction batch"
        );
        new_events.push(terminal);

        Ok(new_events)
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
                    })
                }
            },
            Event::TransactionRecorded(data) => {
                self.recorded_transaction_id_set
                    .insert(*data.get_transaction_id());
            },
            Event::ImportTransactionsCompleted(data) => {
                if self.session_id == data.session_id
                    && self.pending_request_id == Some(data.request_id)
                {
                    self.pending_request_id = None;
                    self.pending_request_data = None;
                }
            },
            Event::ImportTransactionsFailed(data) => {
                if self.session_id == data.session_id
                    && self.pending_request_id == Some(data.request_id)
                {
                    self.pending_request_id = None;
                    self.pending_request_data = None;
                }
            },
            Event::ImportTransactionsContinued(data) => {
                if self.session_id == data.session_id
                    && self.pending_request_id == Some(data.request_id)
                {
                    self.pending_request_data = Some(RequestData {
                        start_date: data.start_date,
                        end_date: data.end_date,
                    })
                }
            },
            Event::TransactionCategorized(_)
            | Event::TransactionClassified(_)
            | Event::TransactionNoteUpdated(_) => {
                // Ignore these transaction events
            },
            Event::BudgetCreated(data) | Event::BudgetUpdated(data) => match data.budget_type {
                BudgetType::Weekly => self.weekly_budget = Some(*data),
                BudgetType::Monthly => self.monthly_budget = Some(*data),
            },
            Event::BudgetDeleted(budget_type) => match budget_type {
                BudgetType::Weekly => self.weekly_budget = None,
                BudgetType::Monthly => self.monthly_budget = None,
            },
            Event::BudgetReset(data) => match data.budget_type {
                BudgetType::Weekly => {
                    if let Some(budget) = &mut self.weekly_budget {
                        budget.start_date = data.start_date;
                    }
                },
                BudgetType::Monthly => {
                    if let Some(budget) = &mut self.monthly_budget {
                        budget.start_date = data.start_date;
                    }
                },
            },
            Event::BudgetExceeded(_) | Event::BudgetExpenseTracked(_) => {
                // These events do not change injector qualification state.
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
            budgets::{
                BudgetData,
                BudgetResetData,
                BudgetType,
            },
            transactions::{
                ImportContinueData,
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
    fn requested_event(request_id: Uuid, session_id: i64) -> Event {
        Event::ImportTransactionsRequested(ImportRequestData {
            request_id,
            session_id,
            start_date: start_date(),
            end_date: end_date(),
        })
    }

    /// Build an injector already holding a pending request, ready to inject events.
    fn pending_injector(session_id: i64, request_id: Uuid) -> EventInjector {
        EventInjector::new(session_id, &[requested_event(request_id, session_id)])
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
        let result = EventInjector::new(1, &[]);
        assert!(matches!(result, Err(DomainError::ComponentInit(_))));
    }

    #[test]
    fn new_fails_after_request_completed() {
        let request_id = Uuid::new_v4();
        let session_id = 1;

        let events = [
            requested_event(request_id, session_id),
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id,
                session_id,
            }),
        ];
        let result = EventInjector::new(session_id, &events);
        assert!(matches!(result, Err(DomainError::ComponentInit(_))));
    }

    #[test]
    fn new_ignores_completion_for_a_different_request() {
        let request_id = Uuid::new_v4();
        let session_id = 1;

        let events = [
            requested_event(request_id, session_id),
            // A completion for an unrelated request must not clear our pending state.
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id: Uuid::new_v4(),
                session_id,
            }),
            Event::ImportTransactionsCompleted(ImportStatusData {
                request_id,
                session_id: 2,
            }),
        ];
        assert!(EventInjector::new(session_id, &events).is_ok());
    }

    #[test]
    fn new_succeeds_with_pending_request() {
        assert!(EventInjector::new(1, &[requested_event(Uuid::new_v4(), 1)]).is_ok());
        assert!(EventInjector::new(2, &[requested_event(Uuid::new_v4(), 1)]).is_err());
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
        let session_id = 1;

        // The event history already contains this exact transaction as a recorded event.
        let injector = EventInjector::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                recorded_event(transaction_with_amount("12.34")),
            ],
        )
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
        let session_id = 1;

        let injector = EventInjector::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                recorded_event(transaction_with_amount("12.34")),
            ],
        )
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
        let session_id = 1;

        let injector = pending_injector(session_id, request_id);

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
        let session_id = 1;

        let injector = pending_injector(session_id, request_id);

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
        let injector = pending_injector(1, Uuid::new_v4());

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
        let injector = pending_injector(1, Uuid::new_v4());

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
        let injector = pending_injector(1, Uuid::new_v4());

        let mut transaction = transaction_with_amount("12.34");
        transaction.booking_date = Some("2026-13-40".to_string());

        // An unparseable date is surfaced as an error rather than dropped.
        let response = TransactionResponse {
            transactions: vec![transaction],
            continuation_key: None,
        };

        assert!(injector.inject_transaction_events(response).is_err());
    }

    /// A matching failure clears the pending request so the injector cannot re-init.
    #[test]
    fn new_fails_after_request_failed() {
        let request_id = Uuid::new_v4();
        let session_id = 1;
        let events = [
            requested_event(request_id, session_id),
            Event::ImportTransactionsFailed(ImportStatusData {
                request_id,
                session_id,
            }),
        ];
        assert!(matches!(
            EventInjector::new(session_id, &events),
            Err(DomainError::ComponentInit(_))
        ));
    }

    /// Failures for a different request or session leave the pending request intact.
    #[test]
    fn new_ignores_failure_for_a_different_request_or_session() {
        let request_id = Uuid::new_v4();
        let session_id = 1;
        // Failure of an unrelated request (different id, same session) keeps ours pending.
        let events = [
            requested_event(request_id, session_id),
            Event::ImportTransactionsFailed(ImportStatusData {
                request_id: Uuid::new_v4(),
                session_id,
            }),
        ];
        assert!(EventInjector::new(session_id, &events).is_ok());
        // Failure of our request on a different session keeps ours pending.
        let events = [
            requested_event(request_id, session_id),
            Event::ImportTransactionsFailed(ImportStatusData {
                request_id,
                session_id: 2,
            }),
        ];
        assert!(EventInjector::new(session_id, &events).is_ok());
    }

    /// A matching continuation updates the request date window used for later injects.
    #[test]
    fn continuation_updates_request_date_window() {
        let request_id = Uuid::new_v4();
        let session_id = 1;
        let new_start = NaiveDate::from_ymd_opt(2026, 6, 10).expect("valid date");
        let new_end = NaiveDate::from_ymd_opt(2026, 6, 20).expect("valid date");
        let injector = EventInjector::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                Event::ImportTransactionsContinued(ImportContinueData {
                    request_id,
                    session_id,
                    start_date: new_start,
                    end_date: new_end,
                    continuation_key: "next".to_string(),
                }),
            ],
        )
        .expect("continuation should not clear the pending request");
        // Inject with a continuation key — dates should come from the continuation.
        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("10.00")],
            continuation_key: Some("next-page".to_string()),
        };
        let events = injector.inject_transaction_events(response).unwrap();
        match events.last() {
            Some(Event::ImportTransactionsContinued(data)) => {
                assert_eq!(data.start_date, new_start);
                assert_eq!(data.end_date, new_end);
            },
            other => panic!("expected ImportTransactionsContinued, got {other:?}"),
        }
    }

    /// Continuations for a different request or session leave the original window unchanged.
    #[test]
    fn continuation_for_a_different_request_or_session_is_ignored() {
        let request_id = Uuid::new_v4();
        let session_id = 1;
        // A continuation for a different request (same session) must not alter our window.
        let injector = EventInjector::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                Event::ImportTransactionsContinued(ImportContinueData {
                    request_id: Uuid::new_v4(),
                    session_id,
                    start_date: NaiveDate::from_ymd_opt(2020, 1, 1).expect("valid date"),
                    end_date: NaiveDate::from_ymd_opt(2020, 1, 1).expect("valid date"),
                    continuation_key: "unrelated".to_string(),
                }),
            ],
        )
        .expect("unrelated continuation should not clear our request");
        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("10.00")],
            continuation_key: Some("next-page".to_string()),
        };
        let events = injector.inject_transaction_events(response).unwrap();
        match events.last() {
            Some(Event::ImportTransactionsContinued(data)) => {
                assert_eq!(data.start_date, start_date());
                assert_eq!(data.end_date, end_date());
            },
            other => panic!("expected ImportTransactionsContinued, got {other:?}"),
        }
    }

    /// Annotation events do not affect the injector's pending request or recorded set.
    #[test]
    fn annotation_events_do_not_affect_pending_or_recorded_state() {
        let request_id = Uuid::new_v4();
        let session_id = 1;
        let injector = EventInjector::new(
            session_id,
            &[
                requested_event(request_id, session_id),
                Event::TransactionCategorized(crate::shared_schema::TransactionCategoryData {
                    transaction_id: Uuid::new_v4(),
                    category: crate::shared_schema::TransactionCategory::Groceries,
                }),
                Event::TransactionClassified(crate::shared_schema::TransactionClassificationData {
                    transaction_id: Uuid::new_v4(),
                    classification: crate::shared_schema::TransactionClassification::MustHave,
                }),
                Event::TransactionNoteUpdated(crate::shared_schema::TransactionNoteData {
                    transaction_id: Uuid::new_v4(),
                    note: "hello".into(),
                }),
            ],
        )
        .expect("annotation events should not clear the pending request");
        // Inject should still complete successfully.
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

    /// New transactions emit a tracked weekly expense when the active weekly budget accepts them.
    #[test]
    fn inject_emits_tracked_expense_for_qualifying_weekly_budget() {
        let request_id = Uuid::new_v4();
        let injector = pending_injector(1, request_id).apply(&Event::BudgetCreated(BudgetData {
            start_date: start_date(),
            budget_type: BudgetType::Weekly,
            amount: 500.0,
            threshold: 50.0,
        }));
        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("25.00")],
            continuation_key: None,
        };

        let events = injector.inject_transaction_events(response).unwrap();

        assert!(matches!(
            events.first(),
            Some(Event::TransactionRecorded(_))
        ));
        assert!(matches!(
            events.get(1),
            Some(Event::BudgetExpenseTracked(data))
                if data.budget_type == BudgetType::Weekly && data.amount == 25.0
        ));
        assert!(matches!(
            events.last(),
            Some(Event::ImportTransactionsCompleted(data)) if data.request_id == request_id
        ));
    }

    /// New transactions emit a tracked monthly expense when the active monthly budget accepts them.
    #[test]
    fn inject_emits_tracked_expense_for_qualifying_monthly_budget() {
        let request_id = Uuid::new_v4();
        let injector = pending_injector(1, request_id).apply(&Event::BudgetCreated(BudgetData {
            start_date: start_date(),
            budget_type: BudgetType::Monthly,
            amount: 2000.0,
            threshold: 100.0,
        }));
        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("75.00")],
            continuation_key: None,
        };

        let events = injector.inject_transaction_events(response).unwrap();

        assert!(matches!(
            events.get(1),
            Some(Event::BudgetExpenseTracked(data))
                if data.budget_type == BudgetType::Monthly && data.amount == 75.0
        ));
    }

    /// A transaction can be tracked by both active budget periods.
    #[test]
    fn inject_emits_one_tracked_expense_per_matching_budget_type() {
        let request_id = Uuid::new_v4();
        let injector = pending_injector(1, request_id)
            .apply(&Event::BudgetCreated(BudgetData {
                start_date: start_date(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 100.0,
            }))
            .apply(&Event::BudgetCreated(BudgetData {
                start_date: start_date(),
                budget_type: BudgetType::Monthly,
                amount: 2000.0,
                threshold: 100.0,
            }));
        let response = TransactionResponse {
            transactions: vec![transaction_with_amount("75.00")],
            continuation_key: None,
        };

        let events = injector.inject_transaction_events(response).unwrap();
        let tracked_types: Vec<BudgetType> = events
            .iter()
            .filter_map(|event| match event {
                Event::BudgetExpenseTracked(data) => Some(data.budget_type),
                _ => None,
            })
            .collect();

        assert_eq!(tracked_types, vec![BudgetType::Weekly, BudgetType::Monthly]);
    }

    /// Transactions outside an active budget period are not tracked.
    #[test]
    fn inject_skips_non_qualifying_budget_expenses() {
        let budgeted_injector = || {
            pending_injector(1, Uuid::new_v4()).apply(&Event::BudgetCreated(BudgetData {
                start_date: start_date(),
                budget_type: BudgetType::Weekly,
                amount: 500.0,
                threshold: 50.0,
            }))
        };
        let tracked_count = |events: &[Event]| {
            events
                .iter()
                .filter(|event| matches!(event, Event::BudgetExpenseTracked(_)))
                .count()
        };

        let over_threshold = budgeted_injector()
            .inject_transaction_events(TransactionResponse {
                transactions: vec![transaction_with_amount("75.00")],
                continuation_key: None,
            })
            .unwrap();
        assert_eq!(tracked_count(&over_threshold), 0);

        let mut before_start = transaction_with_amount("25.00");
        before_start.booking_date = Some("2026-05-31".to_string());
        let before_start = budgeted_injector()
            .inject_transaction_events(TransactionResponse {
                transactions: vec![before_start],
                continuation_key: None,
            })
            .unwrap();
        assert_eq!(tracked_count(&before_start), 0);

        let mut missing_creditor = transaction_with_amount("25.00");
        missing_creditor.creditor = None;
        let missing_creditor = budgeted_injector()
            .inject_transaction_events(TransactionResponse {
                transactions: vec![missing_creditor],
                continuation_key: None,
            })
            .unwrap();
        assert_eq!(tracked_count(&missing_creditor), 0);
    }

    /// Duplicate transactions do not emit either recorded or tracked-expense events.
    #[test]
    fn inject_skips_tracked_expenses_for_duplicate_transactions() {
        let request_id = Uuid::new_v4();
        let injector = EventInjector::new(
            1,
            &[
                requested_event(request_id, 1),
                recorded_event(transaction_with_amount("25.00")),
            ],
        )
        .unwrap()
        .apply(&Event::BudgetCreated(BudgetData {
            start_date: start_date(),
            budget_type: BudgetType::Weekly,
            amount: 500.0,
            threshold: 50.0,
        }));

        let events = injector
            .inject_transaction_events(TransactionResponse {
                transactions: vec![transaction_with_amount("25.00")],
                continuation_key: None,
            })
            .unwrap();

        assert_eq!(recorded_count(&events), 0);
        assert_eq!(
            events
                .iter()
                .filter(|event| matches!(event, Event::BudgetExpenseTracked(_)))
                .count(),
            0
        );
        assert!(matches!(
            events.last(),
            Some(Event::ImportTransactionsCompleted(_))
        ));
    }

    /// Budget lifecycle events establish the data used for later injection.
    #[test]
    fn apply_tracks_active_budget_data() {
        let weekly = BudgetData {
            start_date: start_date(),
            budget_type: BudgetType::Weekly,
            amount: 500.0,
            threshold: 50.0,
        };
        let updated_weekly = BudgetData {
            start_date: end_date(),
            budget_type: BudgetType::Weekly,
            amount: 600.0,
            threshold: 75.0,
        };
        let injector = EventInjector::default()
            .apply(&Event::BudgetCreated(weekly))
            .apply(&Event::BudgetUpdated(updated_weekly));
        assert_eq!(injector.weekly_budget, Some(updated_weekly));

        let reset = Event::BudgetReset(BudgetResetData {
            start_date: end_date(),
            budget_type: BudgetType::Weekly,
            previous_remaining: 100.0,
        });
        let injector = injector.apply(&reset);
        assert_eq!(
            injector.weekly_budget.map(|data| data.start_date),
            Some(end_date())
        );

        let injector = injector.apply(&Event::BudgetDeleted(BudgetType::Weekly));
        assert_eq!(injector.weekly_budget, None);
    }
}
