//! Weekly budgets tracking projections.
use std::str::FromStr;

use domain::events::{
    TransactionCategory,
    TransactionClassification,
    budgets::{
        BudgetData,
        TrackedExpenseData,
    },
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
    /// Amount recorded. Positive for the budget row and for carryover rows
    /// (rollover); negative for tracked transaction rows.
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
    /// Construct a budget projection row from a qualified tracked-expense event.
    ///
    /// The event guarantees a creditor name, so construction cannot be skipped.
    // NOTE: the implementation here is the copy-and-paste of the same method implemented in
    // [`crate::projections::monthly_budgets`].
    // TODO: how to avoid repeating yourself here?
    pub fn from_tracked_expense(data: TrackedExpenseData) -> Self {
        Self {
            transaction_id: Set(data.transaction_id),
            date: Set(data.booking_date),
            amount: Set(-data.amount),
            currency: Set(data.currency),
            creditor_name: Set(data.creditor_name),
            threshold: Set(0.0),
            ..ActiveModelTrait::default()
        }
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

    fn amount_column() -> Self::Column {
        Column::Amount
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

    /// Construct a carryover row for a weekly budget reset.
    ///
    /// The row has a non-nil `transaction_id`, the given date and amount,
    /// `EUR` currency, and a descriptive creditor name identifying it as a
    /// budget carryover.
    fn make_carryover_model(
        new_start_date: Date,
        previous_remaining: f64,
    ) -> <Self as EntityTrait>::ActiveModel {
        ActiveModel {
            transaction_id: Set(Uuid::new_v4()),
            date: Set(Some(new_start_date)),
            amount: Set(previous_remaining),
            currency: Set("EUR".to_string()),
            creditor_name: Set("Weekly budget carryover".to_string()),
            threshold: Set(0.0),
            ..ActiveModelTrait::default()
        }
    }
}

#[cfg(test)]
mod tests {
    use chrono::NaiveDate;
    use domain::events::budgets::{
        BudgetType,
        TrackedExpenseData,
    };
    use uuid::Uuid;

    use super::{
        ActiveModel,
        BudgetProjectionTrait,
        Entity,
    };

    /// A tracked expense maps to a negative weekly budget row.
    #[test]
    fn from_tracked_expense_maps_weekly_projection_fields() {
        let transaction_id = Uuid::new_v4();
        let data = TrackedExpenseData {
            transaction_id,
            booking_date: NaiveDate::from_ymd_opt(2026, 6, 15),
            transaction_date: NaiveDate::from_ymd_opt(2026, 6, 14),
            amount: 42.5,
            currency: "EUR".to_string(),
            creditor_name: "Acme Corp".to_string(),
            budget_type: BudgetType::Weekly,
        };

        let row = ActiveModel::from_tracked_expense(data);

        assert_eq!(row.transaction_id.as_ref(), &transaction_id);
        assert_eq!(row.date.as_ref(), &NaiveDate::from_ymd_opt(2026, 6, 15));
        assert_eq!(row.amount.as_ref(), &-42.5);
        assert_eq!(row.currency.as_ref(), "EUR");
        assert_eq!(row.creditor_name.as_ref(), "Acme Corp");
    }

    /// A positive carryover row captures unspent budget with a non-nil transaction_id.
    #[test]
    fn make_carryover_model_positive_rollover() {
        let date = NaiveDate::from_ymd_opt(2026, 7, 1).unwrap();
        let remaining = 150.0;

        let row = Entity::make_carryover_model(date, remaining);

        assert!(
            !row.transaction_id.as_ref().is_nil(),
            "carryover row must have non-nil transaction_id"
        );
        assert_eq!(row.date.as_ref(), &Some(date));
        assert_eq!(row.amount.as_ref(), &remaining);
        assert_eq!(row.currency.as_ref(), "EUR");
        assert_eq!(row.creditor_name.as_ref(), "Weekly budget carryover");
        assert_eq!(row.threshold.as_ref(), &0.0);
    }

    /// A negative carryover row captures overspending from the previous period.
    #[test]
    fn make_carryover_model_negative_overspending() {
        let date = NaiveDate::from_ymd_opt(2026, 8, 1).unwrap();
        let remaining = -75.0;

        let row = Entity::make_carryover_model(date, remaining);

        assert!(!row.transaction_id.as_ref().is_nil());
        assert_eq!(row.date.as_ref(), &Some(date));
        assert_eq!(row.amount.as_ref(), &remaining);
    }

    /// Two calls to make_carryover_model produce distinct transaction_ids.
    #[test]
    fn make_carryover_model_distinct_ids() {
        let date = NaiveDate::from_ymd_opt(2026, 9, 1).unwrap();

        let row_a = Entity::make_carryover_model(date, 10.0);
        let row_b = Entity::make_carryover_model(date, 20.0);

        assert_ne!(row_a.transaction_id.as_ref(), row_b.transaction_id.as_ref());
    }
}
