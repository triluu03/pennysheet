//! Weekly budgets tracking projections.
use std::str::FromStr;

use domain::events::{
    TransactionCategory,
    TransactionClassification,
    budgets::BudgetData,
    transactions::TransactionData,
};
use regex::Regex;
use sea_orm::{
    ActiveValue::Set,
    entity::prelude::*,
};
use serde::Serialize;

use crate::{
    UserSettingsResult,
    projections::{
        AutoUserSettingTrait,
        BudgetProjectionTrait,
    },
};

#[sea_orm::model]
#[derive(Clone, Debug, Serialize, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "weekly_budgets")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i64,
    pub transaction_id: Uuid,
    pub date: Option<Date>,
    /// Budget or transaction amount recorded. Budget amount is positive while
    /// transaction amount is negative.
    pub amount: f64,
    pub currency: String,
    pub creditor_name: String,
    /// Threshold below which transactions are counted towards the budget.
    /// Only meaningful for the budget row (transaction_id = nil UUID).
    pub threshold: f64,
    pub category: Option<TransactionCategory>,
    pub classification: Option<TransactionClassification>,
    pub auto_category: Option<TransactionCategory>,
    pub auto_classification: Option<TransactionClassification>,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {}

impl ActiveModel {
    /// Construct a model from the recorded transaction data.
    // NOTE: the implementation here is the copy-and-paste of the same method implemented in
    // [`crate::projections::expenses`].
    // TODO: how to avoid repeating yourself here?
    pub fn from_recorded_transaction(data: TransactionData) -> Option<Self> {
        let creditor_name = match data.creditor_name {
            Some(name) => name,
            None => {
                return None;
            },
        };
        Some(Self {
            transaction_id: Set(data.transaction_id),
            date: Set(data.booking_date),
            // NOTE: the transaction amount in this projection is set to be negative.
            amount: Set(-data.amount),
            currency: Set(data.currency),
            creditor_name: Set(creditor_name),
            // Just some placeholder values
            threshold: Set(0.0),
            ..ActiveModelTrait::default()
        })
    }

    /// Apply user regex rules to category and classification
    // NOTE: the implementation here is the copy-and-paste of the same method implemented in
    // [`crate::projections::expenses`].
    // TODO: how to avoid repeating yourself here?
    pub fn apply_user_settings(mut self, user_settings: &[UserSettingsResult]) -> Self {
        let Some(creditor_name) = self.creditor_name.try_as_ref() else {
            return self;
        };

        let Some(setting) = user_settings.iter().find(|setting| {
            Regex::from_str(&setting.regex_rule)
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

impl AutoUserSettingTrait for Entity {
    fn auto_category_column() -> Self::Column {
        self::Column::AutoCategory
    }

    fn auto_classification_column() -> Self::Column {
        self::Column::AutoClassification
    }

    fn regex_rule_target_column() -> Self::Column {
        self::Column::CreditorName
    }
}

#[async_trait::async_trait]
impl BudgetProjectionTrait for Entity {
    fn budget_id_column() -> Self::Column {
        Column::TransactionId
    }

    fn category_column() -> Self::Column {
        Column::Category
    }

    fn classification_column() -> Self::Column {
        Column::Classification
    }

    fn date_column() -> Self::Column {
        Column::Date
    }

    /// Start tracking a new weekly budget.
    ///
    /// Truncates the projection table and inserts a new row representing the
    /// active budget. The budget row uses a zero UUID as its `transaction_id`
    /// placeholder, `EUR` as the currency, and a generic creditor name.
    async fn start_tracking_new_budget<C>(db: &C, budget: &BudgetData) -> Result<(), DbErr>
    where
        C: ConnectionTrait,
    {
        // Truncate the projection table.
        Entity::delete_many().exec(db).await?;

        // Insert a row representing the active budget.
        ActiveModel {
            transaction_id: Set(Uuid::nil()),
            date: Set(Some(budget.start_date)),
            amount: Set(budget.amount),
            currency: Set("EUR".to_string()),
            creditor_name: Set("Weekly budget tracking".to_string()),
            threshold: Set(budget.threshold),
            ..ActiveModelTrait::default()
        }
        .insert(db)
        .await?;

        Ok(())
    }
}
