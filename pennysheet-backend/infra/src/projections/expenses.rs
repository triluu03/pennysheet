//! Expenses projections.

use domain::events::{
    TransactionCategory,
    TransactionClassification,
    transactions::TransactionData,
};
use regex::Regex;
use sea_orm::{
    ActiveValue::Set,
    entity::prelude::*,
};
use serde::Serialize;
use std::str::FromStr;
use tracing::{
    info,
    instrument,
};

use crate::{
    projections::TransactionProjectionTrait,
    user_settings::{
        self,
        UserSettingsResult,
    },
};

#[sea_orm::model]
#[derive(Clone, Debug, Serialize, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "expenses")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i64,
    pub transaction_id: Uuid,
    pub booking_date: Option<Date>,
    pub transaction_date: Option<Date>,
    pub amount: f64,
    pub currency: String,
    pub creditor_name: String,
    pub category: Option<TransactionCategory>,
    pub classification: Option<TransactionClassification>,
    pub auto_category: Option<TransactionCategory>,
    pub auto_classification: Option<TransactionClassification>,
    pub note: Option<String>,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {}

impl ActiveModel {
    /// Construct a model from the recorded transaction data.
    pub fn from_recorded_transaction(data: TransactionData) -> Option<Self> {
        let creditor_name = match data.creditor_name {
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
            creditor_name: Set(creditor_name),
            ..ActiveModelTrait::default()
        })
    }

    /// Apply user regex rules to category and classification
    pub fn apply_user_settings(mut self, user_settings: &[UserSettingsResult]) -> Self {
        let Some(creditor_name) = self.creditor_name.try_as_ref() else {
            return self;
        };

        let Some(setting) = user_settings.iter().find(|setting| {
            Regex::from_str(&setting.regex_rules)
                .map(|r| r.is_match(creditor_name))
                .unwrap_or(false)
        }) else {
            return self;
        };

        self.auto_category = Set(Some(setting.category));
        self.auto_classification = Set(Some(setting.classification));
        self
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

/// Apply the regex rules from user settings to the whole table.
///
/// First, set "auto_category" and "auto_classification" columns in the database to be NULL
/// and apply the user settings one by one over those two columns.
///
/// # Errors
///
/// Returns [`DbErr`] if any step of the operation fails.
#[instrument(skip(db))]
pub async fn apply_user_settings_all<C>(
    db: &C,
    user_settings: &[UserSettingsResult],
) -> Result<(), DbErr>
where
    C: ConnectionTrait,
{
    info!("setting auto category and auto classification to NULL");
    Entity::update_many()
        .col_expr(
            Column::AutoCategory,
            Expr::value(Option::<TransactionCategory>::None),
        )
        .col_expr(
            Column::AutoClassification,
            Expr::value(Option::<TransactionClassification>::None),
        )
        .exec(db)
        .await?;

    info!("updating the user settings one by one");
    for setting in user_settings {
        Entity::update_many()
            .col_expr(Column::AutoCategory, Expr::value(setting.category))
            .col_expr(
                Column::AutoClassification,
                Expr::value(setting.classification),
            )
            .filter(Column::Category.is_null())
            .filter(Column::Classification.is_null())
            .filter(Expr::cust_with_exprs(
                "$1 ~ $2",
                [
                    Expr::col(Column::CreditorName),
                    Expr::value(setting.regex_rules.as_str()),
                ],
            ))
            .exec(db)
            .await?;
    }

    Ok(())
}
