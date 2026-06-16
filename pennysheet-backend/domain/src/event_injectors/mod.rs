//! Event injectors.

use chrono::NaiveDate;
use gateway::schema::enable_banking_api::transaction::{
    Transaction,
    TransactionResponse,
};

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

/// Inject transaction events.
pub fn inject_transaction_events(
    request_id: uuid::Uuid,
    response: TransactionResponse,
) -> Vec<Event> {
    let mut new_events: Vec<Event> = response
        .transactions
        .into_iter()
        .flat_map(record_transaction)
        .collect();

    if let Some(continuation_key) = response.continuation_key {
        new_events.push(Event::ImportTransactionsContinued(ImportContinueData {
            request_id,
            continuation_key,
        }));
    } else {
        new_events.push(Event::ImportTransactionsCompleted(ImportStatusData {
            request_id,
        }));
    }

    new_events
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
