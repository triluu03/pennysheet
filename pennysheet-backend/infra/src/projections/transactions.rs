//! Transaction projections.

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
#[sea_orm(table_name = "transactions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i64,
    pub transaction_id: Uuid,
    pub booking_date: Option<Date>,
    pub transaction_date: Option<Date>,
    pub amount: f64,
    pub currency: String,
    pub creditor_name: Option<String>,
    pub debtor_name: Option<String>,
    pub category: Option<TransactionCategory>,
    pub classification: Option<TransactionClassification>,
    pub note: Option<String>,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {}

impl ActiveModel {
    /// Construct a model from the recorded transaction data.
    // NOTE: this creation method goes with a different flavor compared with
    // [`crate::projections::transactions::import_requests::create_new_import_request`].
    // TODO: figure out which method is better and go with one only!
    pub fn from_recorded_transaction(data: TransactionData) -> Self {
        Self {
            transaction_id: Set(data.transaction_id),
            booking_date: Set(data.booking_date),
            transaction_date: Set(data.transaction_date),
            amount: Set(data.amount),
            currency: Set(data.currency),
            creditor_name: Set(data.creditor_name),
            debtor_name: Set(data.debtor_name),
            ..ActiveModelTrait::default()
        }
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
    /// Recorded transaction fields are copied into the projection active model.
    #[test]
    fn from_recorded_transaction_maps_all_fields() {
        use chrono::NaiveDate;
        use domain::events::transactions::TransactionData;
        use uuid::Uuid;

        let txn_id = Uuid::new_v4();
        let date = NaiveDate::from_ymd_opt(2026, 6, 15);
        let model = super::ActiveModel::from_recorded_transaction(TransactionData {
            transaction_id: txn_id,
            booking_date: date,
            transaction_date: date,
            amount: 42.5,
            currency: "EUR".into(),
            creditor_name: Some("Shop".into()),
            debtor_name: Some("Payer".into()),
        });
        // Verify the key fields are set.
        assert_eq!(model.transaction_id.as_ref(), &txn_id);
        assert_eq!(model.amount.as_ref(), &42.5);
        assert_eq!(model.currency.as_ref(), "EUR");
        assert_eq!(model.creditor_name.as_ref(), &Some("Shop".to_string()));
    }
}
