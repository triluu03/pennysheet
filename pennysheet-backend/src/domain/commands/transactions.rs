//! Transactions-related commands.

use sea_orm::prelude::Date;

use crate::domain::errors::DomainError;

pub struct ImportTransactions {
    pub start_date: Date,
    pub end_date: Date,
}

impl ImportTransactions {
    /// Constructor
    pub fn new(start_date: &str, end_date: Option<&str>) -> Result<Self, DomainError> {
        let parsed_start_date = Date::parse_from_str(start_date, "%Y-%m-%d")?;
        let parsed_end_date = match end_date {
            Some(end_date) => Date::parse_from_str(end_date, "%Y-%m-%d")?,
            None => parsed_start_date.clone(),
        };

        Ok(ImportTransactions {
            start_date: parsed_start_date,
            end_date: parsed_end_date,
        })
    }
}
