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
    fn classification_column() -> Self::Column {
        self::Column::Classification
    }
    fn note_column() -> Self::Column {
        self::Column::Note
    }
}
