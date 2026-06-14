//! Commands.

mod transactions;

use chrono::{
    Local,
    NaiveDate,
};
use transactions::*;

use crate::errors::DomainError;

pub enum Command {
    ImportTransactions(ImportTransactionsData),
}

/// Create a new [`Command::ImportTransactions`] command.
///
/// # Errors
/// Return [`DomainError::CommandCreation`] if start date and end date arguments
/// do not follow the format "%Y-%m-%d".
pub fn create_new_import_transactions_command(
    start_date: Option<&str>,
    end_date: Option<&str>,
) -> Result<Command, DomainError> {
    let parsed_start_date = start_date
        .map(|str| NaiveDate::parse_from_str(str, "%Y-%m-%d"))
        .transpose()?
        .unwrap_or(Local::now().date_naive());

    let parsed_end_date = end_date
        .map(|str| NaiveDate::parse_from_str(str, "%Y-%m-%d"))
        .transpose()?;

    let command = Command::ImportTransactions(ImportTransactionsData::new(
        parsed_start_date,
        parsed_end_date,
    ));

    Ok(command)
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;

    use super::{
        Command,
        create_new_import_transactions_command,
    };
    use crate::errors::DomainError;

    #[test]
    fn both_none_creates_command_with_todays_date() {
        assert!(create_new_import_transactions_command(None, None).is_ok());
    }

    #[test]
    fn valid_start_date_creates_command() {
        let result = create_new_import_transactions_command(Some("2024-01-15"), None);
        let Command::ImportTransactions(data) = result.unwrap();
        assert_eq!(
            data.start_date,
            NaiveDate::from_ymd_opt(2024, 1, 15).unwrap()
        );
    }

    #[test]
    fn valid_start_and_end_dates_creates_command() {
        let result = create_new_import_transactions_command(Some("2024-01-01"), Some("2024-01-31"));
        let Command::ImportTransactions(data) = result.unwrap();
        assert_eq!(
            data.start_date,
            NaiveDate::from_ymd_opt(2024, 1, 1).unwrap()
        );
        assert_eq!(data.end_date, NaiveDate::from_ymd_opt(2024, 1, 31).unwrap());
    }

    #[test]
    fn none_end_date_defaults_end_to_start() {
        let result = create_new_import_transactions_command(Some("2024-06-15"), None);
        let Command::ImportTransactions(data) = result.unwrap();
        assert_eq!(data.start_date, data.end_date);
    }

    #[test]
    fn invalid_start_date_returns_command_creation_error() {
        let result = create_new_import_transactions_command(Some("not-a-date"), None);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    #[test]
    fn invalid_end_date_returns_command_creation_error() {
        let result = create_new_import_transactions_command(Some("2024-01-01"), Some("not-a-date"));
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }
}
