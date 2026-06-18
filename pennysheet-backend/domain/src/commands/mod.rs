//! Commands.

mod transactions;

use chrono::{
    Local,
    NaiveDate,
};
use gateway::schema::enable_banking_api::transaction::TransactionQueryParameters;
use std::str::FromStr;
use transactions::*;
use uuid::Uuid;

use crate::errors::DomainError;
pub use crate::shared_schema::*;

/// Commands to be passed into the [`crate::aggregates::CoreAggregate`].
#[derive(Debug)]
pub enum Command {
    /// Import transactions
    ImportTransactions(ImportTransactionsData),
    /// Retry a failed import request.
    RetryFailedImportRequest(ImportRequestData),
    /// Categorize a transaction.
    CategorizeTransaction(TransactionCategoryData),
    /// Classify a transaction.
    ClassifyTransaction(TransactionClassificationData),
    /// Update the note of a transaction.
    UpdateTransactionNote(TransactionNoteData),
}

/// Commands to be issued into [`gateway`].
#[derive(Debug)]
pub enum GatewayCommand {
    ImportTransactions(TransactionQueryParameters),
}

impl Command {
    /// Create a new [`Command::ImportTransactions`] command.
    ///
    /// # Errors
    ///
    /// Return [`DomainError::CommandCreation`] if start date and end date arguments
    /// do not follow the format "%Y-%m-%d".
    pub fn create_import_transactions(
        start_date: Option<&str>,
        end_date: Option<&str>,
    ) -> Result<Self, DomainError> {
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

    /// Create a new [`Command::RetryFailedImportRequest`] command.
    ///
    /// # Errors
    ///
    /// Return [`DomainError::CommandCreation`] if the provided request ID is not a valid UUID.
    pub fn create_retry_failed_import_request(request_id: &str) -> Result<Self, DomainError> {
        let parsed_request_id = Uuid::from_str(request_id)?;
        Ok(Command::RetryFailedImportRequest(ImportRequestData {
            request_id: parsed_request_id,
        }))
    }

    /// Create a new [`Command::CategorizeTransaction`] command.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::Parsing`] in any of the following scenarios:
    /// - The provided transaction ID is not a valid UUID.
    /// - The provided category does not follow the [`TransactionCategory`] enum.
    pub fn create_categorize_transaction(
        transaction_id: &str,
        category: &str,
    ) -> Result<Self, DomainError> {
        let parsed_transaction_id = Uuid::from_str(transaction_id)?;
        let parsed_category = TransactionCategory::from_str(category)?;

        let command = Command::CategorizeTransaction(TransactionCategoryData {
            transaction_id: parsed_transaction_id,
            category: parsed_category,
        });
        Ok(command)
    }

    /// Create a new [`Command::ClassifyTransaction`] command.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::Parsing`] in any of the following scenarios:
    /// - The provided transaction ID is not a valid UUID.
    /// - The provided classification does not follow the [`TransactionClassification`] enum.
    pub fn create_classify_transaction(
        transaction_id: &str,
        classification: &str,
    ) -> Result<Self, DomainError> {
        let parsed_transaction_id = Uuid::from_str(transaction_id)?;
        let parsed_classification = TransactionClassification::from_str(classification)?;

        let command = Command::ClassifyTransaction(TransactionClassificationData {
            transaction_id: parsed_transaction_id,
            classification: parsed_classification,
        });
        Ok(command)
    }
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;
    use uuid::Uuid;

    use super::Command;
    use crate::errors::DomainError;

    /// Unwrap the result and assert it is an [`Command::ImportTransactions`],
    /// returning the inner data for further assertions.
    fn expect_import_transactions(
        result: Result<Command, DomainError>,
    ) -> super::ImportTransactionsData {
        match result {
            Ok(Command::ImportTransactions(data)) => data,
            other => panic!("expected Command::ImportTransactions, got {other:?}"),
        }
    }

    #[test]
    fn both_none_creates_command_with_todays_date() {
        assert!(Command::create_import_transactions(None, None).is_ok());
    }

    #[test]
    fn valid_start_date_creates_command() {
        let result = Command::create_import_transactions(Some("2024-01-15"), None);
        let data = expect_import_transactions(result);
        assert_eq!(
            data.start_date,
            NaiveDate::from_ymd_opt(2024, 1, 15).unwrap()
        );
    }

    #[test]
    fn valid_start_and_end_dates_creates_command() {
        let result = Command::create_import_transactions(Some("2024-01-01"), Some("2024-01-31"));
        let data = expect_import_transactions(result);
        assert_eq!(
            data.start_date,
            NaiveDate::from_ymd_opt(2024, 1, 1).unwrap()
        );
        assert_eq!(data.end_date, NaiveDate::from_ymd_opt(2024, 1, 31).unwrap());
    }

    #[test]
    fn none_end_date_defaults_end_to_start() {
        let result = Command::create_import_transactions(Some("2024-06-15"), None);
        let data = expect_import_transactions(result);
        assert_eq!(data.start_date, data.end_date);
    }

    #[test]
    fn invalid_start_date_returns_command_creation_error() {
        let result = Command::create_import_transactions(Some("not-a-date"), None);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    #[test]
    fn invalid_end_date_returns_command_creation_error() {
        let result = Command::create_import_transactions(Some("2024-01-01"), Some("not-a-date"));
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    #[test]
    fn valid_request_id_creates_retry_command() {
        let request_id = Uuid::new_v4();
        let result = Command::create_retry_failed_import_request(&request_id.to_string());
        match result {
            Ok(Command::RetryFailedImportRequest(data)) => {
                assert_eq!(data.request_id, request_id);
            },
            other => panic!("expected Command::RetryFailedImportRequest, got {other:?}"),
        }
    }

    #[test]
    fn invalid_request_id_returns_command_creation_error() {
        let result = Command::create_retry_failed_import_request("not-a-uuid");
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    #[test]
    fn empty_request_id_returns_command_creation_error() {
        let result = Command::create_retry_failed_import_request("");
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }
}
