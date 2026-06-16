//! Event injectors.

use chrono::NaiveDate;
use gateway::schema::enable_banking_api::transaction::{
    Transaction,
    TransactionResponse,
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

#[derive(Default, Debug, Clone, Copy)]
pub struct EventInjector {
    request_id: Option<Uuid>,
    start_date: Option<NaiveDate>,
    end_date: Option<NaiveDate>,
}

impl EventInjector {
    /// Constructor.
    ///
    /// # Errors
    /// Returns [`DomainError`] if there's no pending transaction import request
    /// found in the event table.
    pub fn new(all_events: &[Event]) -> Result<Self, DomainError> {
        let new_self = Self {
            ..Default::default()
        }
        .multi_apply(all_events);

        match new_self.request_id {
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
        let mut new_events: Vec<Event> = response
            .transactions
            .into_iter()
            .flat_map(EventInjector::record_transaction)
            .collect();

        if let Some(continuation_key) = response.continuation_key {
            new_events.push(Event::ImportTransactionsContinued(ImportContinueData {
                request_id: self.request_id.ok_or_else(|| {
                    DomainError::EventCreation(
                        "corrupted state of event injector: request_id".to_string(),
                    )
                })?,
                start_date: self.start_date.ok_or_else(|| {
                    DomainError::EventCreation(
                        "corrupted state of event injector: start_date".to_string(),
                    )
                })?,
                end_date: self.end_date.ok_or_else(|| {
                    DomainError::EventCreation(
                        "corrupted state of event injector: end_date".to_string(),
                    )
                })?,
                continuation_key,
            }));
        } else {
            new_events.push(Event::ImportTransactionsCompleted(ImportStatusData {
                request_id: self.request_id.ok_or_else(|| {
                    DomainError::EventCreation(
                        "corrupted state of event injector: request_id".to_string(),
                    )
                })?,
            }));
        }

        Ok(new_events)
    }

    fn record_transaction(transaction: Transaction) -> Result<Event, DomainError> {
        Ok(Event::TransactionRecorded(TransactionData {
            booking_date: transaction
                .booking_date
                .map(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d"))
                .transpose()?,
            transaction_date: transaction
                .transaction_date
                .map(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d"))
                .transpose()?,
            amount: transaction.transaction_amount.amount.parse::<f64>()?,
            currency: transaction.transaction_amount.currency,
            creditor_name: transaction.creditor.and_then(|info| info.name),
            debtor_name: transaction.debtor.and_then(|info| info.name),
        }))
    }

    /// Construct the state from one event.
    pub fn apply(mut self, event: &Event) -> Self {
        match event {
            Event::ImportTransactionsRequested(data) => {
                self.request_id = Some(data.request_id);
                self.start_date = Some(data.start_date);
                self.end_date = Some(data.end_date);
            },
            Event::ImportTransactionsCompleted(data) | Event::ImportTransactionsFailed(data) => {
                if self.request_id == Some(data.request_id) {
                    self.request_id = None;
                    self.start_date = None;
                    self.end_date = None;
                }
            },
            Event::ImportTransactionsContinued(_) | Event::TransactionRecorded(_) => {
                // Ignore these events
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
