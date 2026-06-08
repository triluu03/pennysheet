//! Commands.

mod transactions;

use chrono::{
    Local,
    NaiveDate,
};
use transactions::*;

use crate::domain::errors::DomainError;

pub enum Command {
    ImportTransactions(ImportTransactionsData),
}

/// Create a new [`Command::ImportTransactions`] command.
///
/// # Errors
/// Return [`DomainError`] if start date and end date arguments
/// do not follow the format "%Y-%m-%d".
pub fn create_new_import_transactions_command(
    start_date: Option<&str>,
    end_date: Option<&str>,
) -> Result<Command, DomainError> {
    let parsed_start_date = start_date
        .map(|str| NaiveDate::parse_from_str(str, "%y-%m-%d"))
        .transpose()?
        .unwrap_or(Local::now().date_naive());

    let parsed_end_date = end_date
        .map(|str| NaiveDate::parse_from_str(str, "%y-%m-%d"))
        .transpose()?;

    let command = Command::ImportTransactions(ImportTransactionsData::new(
        parsed_start_date,
        parsed_end_date,
    ));

    Ok(command)
}
