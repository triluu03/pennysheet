//! Transactions-related commands.

use chrono::NaiveDate;

pub struct ImportTransactionsData {
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
}

impl ImportTransactionsData {
    /// Constructor
    pub fn new(start_date: NaiveDate, end_date: Option<NaiveDate>) -> Self {
        ImportTransactionsData {
            start_date,
            end_date: end_date.unwrap_or(start_date),
        }
    }
}
