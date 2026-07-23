//! Commands.

mod budgets;
mod transactions;

use budgets::*;
use chrono::{
    Local,
    NaiveDate,
};
use gateway::schema::enable_banking_api::transaction::TransactionQueryParameters;
use std::str::FromStr;
use transactions::*;
use uuid::Uuid;

pub use crate::shared_schema::*;
use crate::{
    errors::DomainError,
    events::budgets::BudgetType,
};

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
    /// Create a new budget.
    CreateBudget(NewBudgetData),
    /// Update an existing budget.
    UpdateBudget(BudgetUpdateData),
    /// Delete an existing budget based on ID.
    DeleteBudget(BudgetType),
    /// Reset an existing budget with a new start date.
    ResetBudget(ResetBudgetData),
}

/// Commands to be issued into [`gateway`].
#[derive(Debug)]
pub enum GatewayCommand {
    ImportTransactions(TransactionQueryParameters),
}

impl Command {
    /// Create multiple [`Command::ImportTransactions`] commands.
    ///
    /// # Errors
    ///
    /// Return [`DomainError::CommandCreation`] if start date and end date arguments
    /// do not follow the format "%Y-%m-%d".
    pub fn create_import_transactions(
        start_date: Option<&str>,
        end_date: Option<&str>,
        session_ids: Vec<i64>,
    ) -> Result<Vec<Self>, DomainError> {
        let parsed_start_date = start_date
            .map(|str| NaiveDate::parse_from_str(str, "%Y-%m-%d"))
            .transpose()?
            .unwrap_or(Local::now().date_naive());

        let parsed_end_date = end_date
            .map(|str| NaiveDate::parse_from_str(str, "%Y-%m-%d"))
            .transpose()?;

        let commands = session_ids
            .iter()
            .map(|session_id| {
                Command::ImportTransactions(ImportTransactionsData::new(
                    parsed_start_date,
                    parsed_end_date,
                    *session_id,
                ))
            })
            .collect();

        Ok(commands)
    }

    /// Create a new [`Command::RetryFailedImportRequest`] command.
    ///
    /// # Errors
    ///
    /// Return [`DomainError::CommandCreation`] if the provided request ID is not a valid UUID.
    pub fn create_retry_failed_import_request(
        request_id: &str,
        session_id: i64,
    ) -> Result<Self, DomainError> {
        let parsed_request_id = Uuid::from_str(request_id)?;
        Ok(Command::RetryFailedImportRequest(ImportRequestData {
            request_id: parsed_request_id,
            session_id,
        }))
    }

    /// Create a new [`Command::CategorizeTransaction`] command.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError`] in any of the following scenarios:
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
    /// Returns [`DomainError`] in any of the following scenarios:
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

    /// Create a new [`Command::UpdateTransactionNote`] command.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::CommandCreation`] in any of the following scenarios:
    /// - The provided transaction ID is not a valid UUID.
    pub fn create_update_transaction_note(
        transaction_id: &str,
        note: &str,
    ) -> Result<Self, DomainError> {
        let parsed_transaction_id = Uuid::from_str(transaction_id)?;

        let command = Command::UpdateTransactionNote(TransactionNoteData {
            transaction_id: parsed_transaction_id,
            note: note.to_string(),
        });
        Ok(command)
    }

    /// Create a new [`Command::CreateBudget`] command.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::CommandCreation`] if `start_date` does not follow the
    /// format `"%Y-%m-%d"` or `budget_type` is not a recognized variant.
    pub fn create_budget(
        start_date: &str,
        budget_type: BudgetType,
        amount: f64,
        threshold: f64,
    ) -> Result<Self, DomainError> {
        let parsed_start_date = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")?;

        Ok(Command::CreateBudget(NewBudgetData {
            start_date: parsed_start_date,
            budget_type,
            amount,
            threshold,
        }))
    }

    /// Create a new [`Command::UpdateBudget`] command.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::CommandCreation`] if `start_date` does not follow the
    /// format `"%Y-%m-%d"` or `budget_type` is not a recognized variant.
    pub fn create_update_budget(
        start_date: &str,
        budget_type: BudgetType,
        amount: f64,
        threshold: f64,
    ) -> Result<Self, DomainError> {
        let parsed_start_date = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")?;

        Ok(Command::UpdateBudget(BudgetUpdateData {
            start_date: parsed_start_date,
            budget_type,
            amount,
            threshold,
        }))
    }

    /// Create a new [`Command::DeleteBudget`] command.
    ///
    /// # Errors
    ///
    /// This constructor is infallible; the `Result` return type is for
    /// consistency with the other command factory methods.
    pub fn create_delete_budget(budget_type: BudgetType) -> Result<Self, DomainError> {
        Ok(Command::DeleteBudget(budget_type))
    }

    /// Create a new [`Command::ResetBudget`] command.
    ///
    /// # Errors
    ///
    /// Returns [`DomainError::CommandCreation`] if `start_date` does not follow the
    /// format `"%Y-%m-%d"`.
    pub fn create_reset_budget(
        start_date: &str,
        budget_type: BudgetType,
    ) -> Result<Self, DomainError> {
        let parsed_start_date = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")?;
        Ok(Command::ResetBudget(ResetBudgetData {
            start_date: parsed_start_date,
            budget_type,
        }))
    }
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;
    use uuid::Uuid;

    use super::Command;
    use crate::{
        errors::DomainError,
        events::budgets::BudgetType,
    };

    /// Unwrap the result and assert it is an [`Command::ImportTransactions`],
    /// returning the inner data for further assertions.
    fn expect_one_import_transactions_command(
        result: Result<Vec<Command>, DomainError>,
    ) -> super::ImportTransactionsData {
        match result {
            //Ok(Command::ImportTransactions(data)) => data,
            Ok(commands) => {
                assert_eq!(commands.len(), 1);
                if let Command::ImportTransactions(data) = commands.first().unwrap() {
                    data.to_owned()
                } else {
                    panic!("expected one Command::ImportTransactions");
                }
            },
            other => panic!("expected Command::ImportTransactions, got {other:?}"),
        }
    }

    #[test]
    fn both_none_creates_command_with_todays_date() {
        assert!(Command::create_import_transactions(None, None, vec![1, 2]).is_ok());
    }

    #[test]
    fn valid_start_date_creates_command() {
        let result = Command::create_import_transactions(Some("2024-01-15"), None, vec![1]);
        let data = expect_one_import_transactions_command(result);
        assert_eq!(
            data.start_date,
            NaiveDate::from_ymd_opt(2024, 1, 15).unwrap()
        );
    }

    #[test]
    fn valid_start_and_end_dates_creates_command() {
        let result =
            Command::create_import_transactions(Some("2024-01-01"), Some("2024-01-31"), vec![1]);
        let data = expect_one_import_transactions_command(result);
        assert_eq!(
            data.start_date,
            NaiveDate::from_ymd_opt(2024, 1, 1).unwrap()
        );
        assert_eq!(data.end_date, NaiveDate::from_ymd_opt(2024, 1, 31).unwrap());
    }

    #[test]
    fn none_end_date_defaults_end_to_start() {
        let result = Command::create_import_transactions(Some("2024-06-15"), None, vec![1]);
        let data = expect_one_import_transactions_command(result);
        assert_eq!(data.start_date, data.end_date);
    }

    #[test]
    fn invalid_start_date_returns_command_creation_error() {
        let result = Command::create_import_transactions(Some("not-a-date"), None, vec![1]);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    #[test]
    fn invalid_end_date_returns_command_creation_error() {
        let result =
            Command::create_import_transactions(Some("2024-01-01"), Some("not-a-date"), vec![1]);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    #[test]
    fn valid_request_id_creates_retry_command() {
        let request_id = Uuid::new_v4();
        let result = Command::create_retry_failed_import_request(&request_id.to_string(), 1);
        match result {
            Ok(Command::RetryFailedImportRequest(data)) => {
                assert_eq!(data.request_id, request_id);
            },
            other => panic!("expected Command::RetryFailedImportRequest, got {other:?}"),
        }
    }

    #[test]
    fn invalid_request_id_returns_command_creation_error() {
        let result = Command::create_retry_failed_import_request("not-a-uuid", 1);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    #[test]
    fn empty_request_id_returns_command_creation_error() {
        let result = Command::create_retry_failed_import_request("", 1);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    /// One import command is created per provided session id.
    #[test]
    fn create_import_transactions_emits_one_command_per_session_id() {
        let commands = Command::create_import_transactions(None, None, vec![1, 2, 3]).unwrap();
        assert_eq!(commands.len(), 3);
        for (i, cmd) in commands.iter().enumerate() {
            assert!(matches!(cmd, Command::ImportTransactions(_)));
            if let Command::ImportTransactions(data) = cmd {
                assert_eq!(data.session_id, (i + 1) as i64);
            }
        }
    }

    /// A valid transaction id and category produce a categorize command.
    #[test]
    fn create_categorize_transaction_succeeds_with_valid_inputs() {
        let txn_id = Uuid::new_v4();
        let result = Command::create_categorize_transaction(&txn_id.to_string(), "groceries");
        match result {
            Ok(Command::CategorizeTransaction(data)) => {
                assert_eq!(data.transaction_id, txn_id);
                assert_eq!(
                    data.category,
                    crate::shared_schema::TransactionCategory::Groceries
                );
            },
            other => panic!("expected CategorizeTransaction, got {other:?}"),
        }
    }

    /// An invalid transaction id rejects categorize-command creation.
    #[test]
    fn create_categorize_transaction_rejects_invalid_transaction_id() {
        assert!(matches!(
            Command::create_categorize_transaction("not-a-uuid", "groceries"),
            Err(DomainError::CommandCreation(_))
        ));
    }

    /// An unknown category rejects categorize-command creation.
    #[test]
    fn create_categorize_transaction_rejects_unknown_category() {
        let result =
            Command::create_categorize_transaction(&Uuid::new_v4().to_string(), "not-a-category");
        assert!(matches!(result, Err(DomainError::Parsing(_))));
    }

    /// A valid transaction id and classification produce a classify command.
    #[test]
    fn create_classify_transaction_succeeds_with_valid_inputs() {
        let txn_id = Uuid::new_v4();
        let result = Command::create_classify_transaction(&txn_id.to_string(), "must-have");
        match result {
            Ok(Command::ClassifyTransaction(data)) => {
                assert_eq!(data.transaction_id, txn_id);
                assert_eq!(
                    data.classification,
                    crate::shared_schema::TransactionClassification::MustHave
                );
            },
            other => panic!("expected ClassifyTransaction, got {other:?}"),
        }
    }

    /// An invalid transaction id rejects classify-command creation.
    #[test]
    fn create_classify_transaction_rejects_invalid_transaction_id() {
        assert!(matches!(
            Command::create_classify_transaction("not-a-uuid", "must-have"),
            Err(DomainError::CommandCreation(_))
        ));
    }

    /// An unknown classification rejects classify-command creation.
    #[test]
    fn create_classify_transaction_rejects_unknown_classification() {
        let result = Command::create_classify_transaction(
            &Uuid::new_v4().to_string(),
            "not-a-classification",
        );
        assert!(matches!(result, Err(DomainError::Parsing(_))));
    }

    /// A valid transaction id and note produce an update-note command.
    #[test]
    fn create_update_transaction_note_succeeds_with_valid_inputs() {
        let txn_id = Uuid::new_v4();
        let result = Command::create_update_transaction_note(&txn_id.to_string(), "my note");
        match result {
            Ok(Command::UpdateTransactionNote(data)) => {
                assert_eq!(data.transaction_id, txn_id);
                assert_eq!(data.note, "my note");
            },
            other => panic!("expected UpdateTransactionNote, got {other:?}"),
        }
    }

    /// An invalid transaction id rejects update-note command creation.
    #[test]
    fn create_update_transaction_note_rejects_invalid_transaction_id() {
        assert!(matches!(
            Command::create_update_transaction_note("not-a-uuid", "my note"),
            Err(DomainError::CommandCreation(_))
        ));
    }

    /// A valid start date and weekly budget type produce a create-budget command.
    #[test]
    fn create_budget_succeeds_with_valid_inputs() {
        let result = Command::create_budget("2026-01-15", BudgetType::Weekly, 500.0, 50.0);
        match result {
            Ok(Command::CreateBudget(data)) => {
                assert_eq!(
                    data.start_date,
                    NaiveDate::from_ymd_opt(2026, 1, 15).unwrap()
                );
                assert_eq!(data.budget_type, BudgetType::Weekly);
                assert!((data.amount - 500.0).abs() < f64::EPSILON);
                assert!((data.threshold - 50.0).abs() < f64::EPSILON);
            },
            other => panic!("expected CreateBudget, got {other:?}"),
        }
    }

    /// An invalid start date rejects create-budget command creation.
    #[test]
    fn create_budget_rejects_invalid_start_date() {
        let result = Command::create_budget("not-a-date", BudgetType::Weekly, 500.0, 50.0);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    /// A valid start date and monthly budget type produce a create-budget command.
    #[test]
    fn create_budget_succeeds_with_monthly_budget_type() {
        let result = Command::create_budget("2026-06-01", BudgetType::Monthly, 300.0, 25.0);
        match result {
            Ok(Command::CreateBudget(data)) => {
                assert_eq!(data.budget_type, BudgetType::Monthly);
                assert!((data.amount - 300.0).abs() < f64::EPSILON);
            },
            other => panic!("expected CreateBudget, got {other:?}"),
        }
    }

    /// A valid start date and updated amount produce an update-budget command.
    #[test]
    fn create_update_budget_succeeds_with_valid_inputs() {
        let result = Command::create_update_budget("2026-01-15", BudgetType::Weekly, 500.0, 50.0);
        match result {
            Ok(Command::UpdateBudget(data)) => {
                assert_eq!(
                    data.start_date,
                    NaiveDate::from_ymd_opt(2026, 1, 15).unwrap()
                );
                assert_eq!(data.budget_type, BudgetType::Weekly);
                assert!((data.amount - 500.0).abs() < f64::EPSILON);
                assert!((data.threshold - 50.0).abs() < f64::EPSILON);
            },
            other => panic!("expected UpdateBudget, got {other:?}"),
        }
    }

    /// An invalid start date rejects update-budget command creation.
    #[test]
    fn create_update_budget_rejects_invalid_start_date() {
        let result = Command::create_update_budget("not-a-date", BudgetType::Monthly, 300.0, 30.0);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }

    /// Creating a delete-budget command returns the correct budget type.
    #[test]
    fn create_delete_budget_succeeds_with_valid_budget_type() {
        let result = Command::create_delete_budget(BudgetType::Weekly);
        assert!(matches!(
            result,
            Ok(Command::DeleteBudget(BudgetType::Weekly))
        ));

        let result = Command::create_delete_budget(BudgetType::Monthly);
        assert!(matches!(
            result,
            Ok(Command::DeleteBudget(BudgetType::Monthly))
        ));
    }

    /// Creating a reset-budget command with a valid start date returns the correct budget type and
    /// date.
    #[test]
    fn create_reset_budget_succeeds_with_valid_start_date_and_budget_type() {
        let result = Command::create_reset_budget("2026-02-01", BudgetType::Monthly);
        match result {
            Ok(Command::ResetBudget(data)) => {
                assert_eq!(
                    data.start_date,
                    NaiveDate::from_ymd_opt(2026, 2, 1).unwrap()
                );
                assert_eq!(data.budget_type, BudgetType::Monthly);
            },
            other => panic!("expected ResetBudget, got {other:?}"),
        }

        let result = Command::create_reset_budget("2026-03-15", BudgetType::Weekly);
        match result {
            Ok(Command::ResetBudget(data)) => {
                assert_eq!(
                    data.start_date,
                    NaiveDate::from_ymd_opt(2026, 3, 15).unwrap()
                );
                assert_eq!(data.budget_type, BudgetType::Weekly);
            },
            other => panic!("expected ResetBudget, got {other:?}"),
        }
    }

    /// An invalid start date rejects reset-budget command creation.
    #[test]
    fn create_reset_budget_rejects_invalid_start_date() {
        let result = Command::create_reset_budget("not-a-date", BudgetType::Weekly);
        assert!(matches!(result, Err(DomainError::CommandCreation(_))));
    }
}
