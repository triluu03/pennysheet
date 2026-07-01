//! Transactions-related event data.

use chrono::NaiveDate;
use gateway::schema::enable_banking_api;
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

use crate::errors::DomainError;

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportRequestData {
    pub request_id: Uuid,
    pub session_id: i64,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
}

impl ImportRequestData {
    /// Import transactions requested constructor.
    pub fn new(start_date: NaiveDate, end_date: NaiveDate, session_id: i64) -> Self {
        ImportRequestData {
            request_id: Uuid::new_v4(),
            session_id,
            start_date,
            end_date,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportStatusData {
    pub request_id: Uuid,
    pub session_id: i64,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImportContinueData {
    pub request_id: Uuid,
    pub session_id: i64,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub continuation_key: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct TransactionData {
    pub transaction_id: Uuid,
    pub booking_date: Option<NaiveDate>,
    pub transaction_date: Option<NaiveDate>,
    pub amount: f64,
    pub currency: String,
    pub creditor_name: Option<String>,
    pub debtor_name: Option<String>,
}

/// UUID namespace for Transactions Data.
pub const NAMESPACE_TRANSACTION_DATA: Uuid = Uuid::from_bytes([
    0x6b, 0xa6, 0xb7, 0x14, 0x9d, 0xad, 0x11, 0xd1, 0x80, 0xb4, 0x00, 0xc0, 0x4f, 0xd4, 0x30, 0xc8,
]);

impl TransactionData {
    /// Constructor
    ///
    /// # Errors
    ///
    /// Return [`DomainError`] if parsing the values from
    /// [`enable_banking_api::transaction::Transaction`] fails.
    pub fn new(
        transaction: enable_banking_api::transaction::Transaction,
    ) -> Result<Self, DomainError> {
        let booking_date = transaction
            .booking_date
            .map(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d"))
            .transpose()?;
        let transaction_date = transaction
            .transaction_date
            .map(|value| NaiveDate::parse_from_str(&value, "%Y-%m-%d"))
            .transpose()?;
        let amount = transaction.transaction_amount.amount.parse::<f64>()?;
        let currency = transaction.transaction_amount.currency;
        let creditor_name = transaction.creditor.and_then(|info| info.name);
        let debtor_name = transaction.debtor.and_then(|info| info.name);

        // TODO: incorporate more information into the `transaction_id`
        let transaction_id = Uuid::new_v5(
            &NAMESPACE_TRANSACTION_DATA,
            format!(
                "transaction_data:{}:{}:{amount}:{currency}:{}:{}",
                booking_date.map_or("None".to_string(), |v| v.to_string()),
                transaction_date.map_or("None".to_string(), |v| v.to_string()),
                creditor_name.clone().unwrap_or("None".to_string()),
                debtor_name.clone().unwrap_or("None".to_string()),
            )
            .as_bytes(),
        );

        Ok(Self {
            transaction_id,
            booking_date,
            transaction_date,
            amount,
            currency,
            creditor_name,
            debtor_name,
        })
    }

    /// Get transaction ID.
    pub fn get_transaction_id(&self) -> &Uuid {
        &self.transaction_id
    }
}

#[cfg(test)]
mod tests {
    use gateway::schema::enable_banking_api::{
        AmountType,
        transaction::{
            PartyIdentification,
            Transaction,
        },
    };
    use uuid::Uuid;

    use super::{
        NAMESPACE_TRANSACTION_DATA,
        TransactionData,
    };

    /// Build a fully-populated, valid gateway `Transaction`.
    fn sample_transaction() -> Transaction {
        Transaction {
            transaction_amount: AmountType {
                currency: "EUR".to_string(),
                amount: "42.50".to_string(),
            },
            creditor: Some(PartyIdentification {
                name: Some("Acme Corp".to_string()),
            }),
            debtor: Some(PartyIdentification {
                name: Some("Jane Doe".to_string()),
            }),
            booking_date: Some("2026-06-15".to_string()),
            transaction_date: Some("2026-06-14".to_string()),
        }
    }

    /// Construct a [`TransactionData`] and return its derived transaction id.
    fn id_of(transaction: Transaction) -> Uuid {
        *TransactionData::new(transaction)
            .expect("sample transaction has valid fields")
            .get_transaction_id()
    }

    #[test]
    fn transaction_id_is_identical_for_identical_input() {
        assert_eq!(id_of(sample_transaction()), id_of(sample_transaction()));
    }

    #[test]
    fn transaction_id_matches_expected_uuid_v5() {
        let expected = Uuid::new_v5(
            &NAMESPACE_TRANSACTION_DATA,
            "transaction_data:2026-06-15:2026-06-14:42.5:EUR:Acme Corp:Jane Doe".as_bytes(),
        );
        assert_eq!(id_of(sample_transaction()), expected);
    }

    #[test]
    fn transaction_id_differs_when_amount_differs() {
        let base = id_of(sample_transaction());
        let mut changed = sample_transaction();
        changed.transaction_amount.amount = "99.99".to_string();
        assert_ne!(base, id_of(changed));
    }

    #[test]
    fn transaction_id_differs_when_currency_differs() {
        let base = id_of(sample_transaction());
        let mut changed = sample_transaction();
        changed.transaction_amount.currency = "USD".to_string();
        assert_ne!(base, id_of(changed));
    }

    #[test]
    fn transaction_id_differs_when_booking_date_differs() {
        let base = id_of(sample_transaction());
        let mut changed = sample_transaction();
        changed.booking_date = Some("2026-06-16".to_string());
        assert_ne!(base, id_of(changed));
    }

    #[test]
    fn transaction_id_differs_when_transaction_date_differs() {
        let base = id_of(sample_transaction());
        let mut changed = sample_transaction();
        changed.transaction_date = Some("2026-06-13".to_string());
        assert_ne!(base, id_of(changed));
    }

    #[test]
    fn transaction_id_differs_when_creditor_name_differs() {
        let base = id_of(sample_transaction());
        let mut changed = sample_transaction();
        changed.creditor = Some(PartyIdentification {
            name: Some("Other Corp".to_string()),
        });
        assert_ne!(base, id_of(changed));
    }

    #[test]
    fn transaction_id_differs_when_debtor_name_differs() {
        let base = id_of(sample_transaction());
        let mut changed = sample_transaction();
        changed.debtor = Some(PartyIdentification {
            name: Some("John Smith".to_string()),
        });
        assert_ne!(base, id_of(changed));
    }

    #[test]
    fn transaction_id_distinguishes_absent_from_present_optional_fields() {
        let base = id_of(sample_transaction());
        let mut without_creditor = sample_transaction();
        without_creditor.creditor = None;
        assert_ne!(base, id_of(without_creditor));
    }
}
