//! Transactions-related commands.

use sea_orm::prelude::Date;

pub struct ImportTransactions {
    pub start_date: Date,
    pub end_date: Date,
}

impl ImportTransactions {
    /// Constructor
    pub fn new(start_date: &str, end_date: Option<&str>) -> Self {
        let parsed_start_date = Date::parse_from_str(start_date, "%Y-%m-%d").unwrap();
        let parsed_end_date = match end_date {
            Some(end_date) => Date::parse_from_str(end_date, "%Y-%m-%d").unwrap(),
            None => parsed_start_date.clone(),
        };

        ImportTransactions {
            start_date: parsed_start_date,
            end_date: parsed_end_date,
        }
    }
}
