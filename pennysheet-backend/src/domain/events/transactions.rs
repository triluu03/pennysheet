//! Transactions-related event data.

use chrono::NaiveDate;
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportRequestData {
    pub request_id: Uuid,
    start_date: NaiveDate,
    end_date: NaiveDate,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportStatusData {
    pub request_id: Uuid,
}

const NAMESPACE_EVENT_DATA: Uuid = Uuid::from_bytes([
    0x6a, 0xa7, 0xb8, 0x12, 0x9d, 0xad, 0x11, 0xd1, 0x80, 0xb4, 0x00, 0xc0, 0x4f, 0xd4, 0x30, 0xc8,
]);

impl ImportRequestData {
    /// Import transactions requested constructor.
    pub fn new(start_date: NaiveDate, end_date: NaiveDate) -> Self {
        let uuid_key = "ImportRequestData:".to_string()
            + &start_date.to_string()
            + ":"
            + &end_date.to_string();

        ImportRequestData {
            request_id: Uuid::new_v5(&NAMESPACE_EVENT_DATA, uuid_key.as_bytes()),
            start_date,
            end_date,
        }
    }
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;

    use super::ImportRequestData;

    fn jan(day: u32) -> NaiveDate {
        NaiveDate::from_ymd_opt(2024, 1, day).unwrap()
    }

    #[test]
    fn request_id_is_deterministic_for_same_dates() {
        let a = ImportRequestData::new(jan(1), jan(31));
        let b = ImportRequestData::new(jan(1), jan(31));
        assert_eq!(a.request_id, b.request_id);
    }

    #[test]
    fn request_id_differs_for_different_start_date() {
        let a = ImportRequestData::new(jan(1), jan(31));
        let b = ImportRequestData::new(jan(2), jan(31));
        assert_ne!(a.request_id, b.request_id);
    }

    #[test]
    fn request_id_differs_for_different_end_date() {
        let a = ImportRequestData::new(jan(1), jan(30));
        let b = ImportRequestData::new(jan(1), jan(31));
        assert_ne!(a.request_id, b.request_id);
    }

    #[test]
    fn request_id_is_not_nil() {
        let data = ImportRequestData::new(jan(1), jan(31));
        assert!(!data.request_id.is_nil());
    }
}
