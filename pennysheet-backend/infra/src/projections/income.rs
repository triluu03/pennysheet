//! Income projections.

use domain::events::{
    TransactionCategory,
    TransactionClassification,
    transactions::TransactionData,
};
use sea_orm::{
    ActiveValue::Set,
    entity::prelude::*,
};
use serde::Serialize;

use crate::projections::TransactionProjectionTrait;

#[sea_orm::model]
#[derive(Clone, Debug, Serialize, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "income")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i64,
    pub transaction_id: Uuid,
    pub booking_date: Option<Date>,
    pub transaction_date: Option<Date>,
    pub amount: f64,
    pub currency: String,
    pub debtor_name: String,
    pub category: Option<TransactionCategory>,
    pub classification: Option<TransactionClassification>,
    pub note: Option<String>,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {}

impl ActiveModel {
    /// Construct a model from the recorded transaction data.
    pub fn from_recorded_transaction(data: TransactionData) -> Option<Self> {
        let debtor_name = match data.debtor_name {
            Some(name) => name,
            None => {
                return None;
            },
        };
        Some(Self {
            transaction_id: Set(data.transaction_id),
            booking_date: Set(data.booking_date),
            transaction_date: Set(data.transaction_date),
            amount: Set(data.amount),
            currency: Set(data.currency),
            debtor_name: Set(debtor_name),
            ..ActiveModelTrait::default()
        })
    }
}

impl TransactionProjectionTrait for Entity {
    fn id_column() -> Self::Column {
        self::Column::TransactionId
    }
    fn amount_column() -> Self::Column {
        self::Column::Amount
    }
    fn booking_date_column() -> Self::Column {
        self::Column::BookingDate
    }
    fn category_column() -> Self::Column {
        self::Column::Category
    }
    fn auto_category_column() -> Option<Self::Column> {
        None
    }
    fn classification_column() -> Self::Column {
        self::Column::Classification
    }
    fn auto_classification_column() -> Option<Self::Column> {
        None
    }
    fn note_column() -> Self::Column {
        self::Column::Note
    }
}

#[cfg(test)]
mod tests {
    use domain::events::transactions::TransactionData;
    use uuid::Uuid;

    /// Build a [`TransactionData`] with the given debtor (or none).
    fn sample_transaction_data(debtor: Option<&str>) -> TransactionData {
        TransactionData {
            transaction_id: Uuid::new_v4(),
            booking_date: None,
            transaction_date: None,
            amount: 100.0,
            currency: "EUR".into(),
            creditor_name: None,
            debtor_name: debtor.map(|d| d.to_string()),
        }
    }

    /// Income models are built only when a debtor name is present.
    #[test]
    fn from_recorded_transaction_returns_some_when_debtor_present() {
        let model = super::ActiveModel::from_recorded_transaction(sample_transaction_data(Some(
            "Employer",
        )));
        assert!(model.is_some());
    }

    /// Missing debtor names are treated as non-income.
    #[test]
    fn from_recorded_transaction_returns_none_when_debtor_absent() {
        let model = super::ActiveModel::from_recorded_transaction(sample_transaction_data(None));
        assert!(model.is_none());
    }
}
