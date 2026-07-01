//! Transactions-related commands.

use chrono::NaiveDate;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct ImportTransactionsData {
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub session_id: i64,
}

impl ImportTransactionsData {
    /// Constructor.
    ///
    /// end_date is set to the same value as start_date if not provided.
    pub fn new(start_date: NaiveDate, end_date: Option<NaiveDate>, session_id: i64) -> Self {
        ImportTransactionsData {
            start_date,
            end_date: end_date.unwrap_or(start_date),
            session_id,
        }
    }
}

#[derive(Debug)]
pub struct ImportRequestData {
    pub request_id: Uuid,
    pub session_id: i64,
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;

    use super::ImportTransactionsData;

    #[test]
    fn none_end_date_defaults_to_start() {
        let start = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();
        let data = ImportTransactionsData::new(start, None, 1);
        assert_eq!(data.start_date, start);
        assert_eq!(data.end_date, start);
        assert_eq!(data.session_id, 1);
    }

    #[test]
    fn some_end_date_uses_provided() {
        let start = NaiveDate::from_ymd_opt(2024, 1, 1).unwrap();
        let end = NaiveDate::from_ymd_opt(2024, 1, 31).unwrap();
        let data = ImportTransactionsData::new(start, Some(end), 100);
        assert_eq!(data.start_date, start);
        assert_eq!(data.end_date, end);
        assert_eq!(data.session_id, 100);
    }
}
