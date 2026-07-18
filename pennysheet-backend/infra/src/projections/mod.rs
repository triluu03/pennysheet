//! Projections.

use domain::events::{
    TransactionCategory,
    TransactionClassification,
};
use sea_orm::{
    entity::prelude::*,
    prelude::{
        Expr,
        async_trait,
    },
    sea_query::{
        Func,
        SimpleExpr,
    },
    *,
};
use serde::{
    Deserialize,
    Serialize,
};
use tracing::{
    info,
    instrument,
};
use uuid::Uuid;

use crate::UserSettingsResult;

pub mod expenses;
pub mod import_requests;
pub mod income;
pub(crate) mod projector_states;
pub mod transactions;

/// Time aggregation for aggregating the transactions projections.
#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TimeAggregation {
    Daily,
    Weekly,
    #[default]
    Monthly,
}

/// Aggregated SELECT results.
#[derive(Debug, Serialize, FromQueryResult)]
pub struct AggregatedResult {
    date: Date,
    amount: f64,
}

/// An abstract base class for a transaction-related projection.
#[async_trait::async_trait]
pub trait TransactionProjectionTrait: EntityTrait {
    /// Transaction ID column.
    fn id_column() -> Self::Column;

    /// Booking date column.
    fn booking_date_column() -> Self::Column;

    /// Amount column
    fn amount_column() -> Self::Column;

    /// Category column
    fn category_column() -> Self::Column;
    /// Auto-category column
    fn auto_category_column() -> Option<Self::Column>;

    /// Classification column
    fn classification_column() -> Self::Column;
    /// Auto-classification column
    fn auto_classification_column() -> Option<Self::Column>;

    /// Note column
    fn note_column() -> Self::Column;

    /// Update the value of a column in the database.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the update operation fails.
    async fn update_column_value<C>(
        db: &C,
        transaction_id: Uuid,
        column: Self::Column,
        value: SimpleExpr,
    ) -> Result<(), DbErr>
    where
        C: ConnectionTrait,
    {
        Self::update_many()
            .col_expr(column, value)
            .filter(Self::id_column().eq(transaction_id))
            .exec(db)
            .await
            .map(|_| ())
    }

    /// Update category of a transaction.
    async fn update_category<C>(
        db: &C,
        transaction_id: Uuid,
        category: TransactionCategory,
    ) -> Result<(), DbErr>
    where
        C: ConnectionTrait,
    {
        Self::update_column_value(
            db,
            transaction_id,
            Self::category_column(),
            Expr::value(category),
        )
        .await
        .map(|_| ())
    }

    /// Update classification of a transaction.
    async fn update_classification<C>(
        db: &C,
        transaction_id: Uuid,
        classification: TransactionClassification,
    ) -> Result<(), DbErr>
    where
        C: ConnectionTrait,
    {
        Self::update_column_value(
            db,
            transaction_id,
            Self::classification_column(),
            Expr::value(classification),
        )
        .await
        .map(|_| ())
    }

    /// Update the note of a transaction.
    async fn update_note<C>(db: &C, transaction_id: Uuid, note: String) -> Result<(), DbErr>
    where
        C: ConnectionTrait,
    {
        Self::update_column_value(db, transaction_id, Self::note_column(), Expr::value(note))
            .await
            .map(|_| ())
    }

    /// Get transactions.
    ///
    /// # Errors
    /// Returns [`DbErr`] if the query fails.
    async fn get_transactions<C>(
        db: &C,
        start_date: Option<Date>,
        end_date: Option<Date>,
        transaction_id: Option<Uuid>,
        // TODO: make these categories and classifications to be Option<Vec<_>>, so the query
        // doesn't need to have the FILTERS everytime.
        categories: Vec<TransactionCategory>,
        classifications: Vec<TransactionClassification>,
    ) -> Result<Vec<Self::Model>, DbErr>
    where
        C: ConnectionTrait,
    {
        Self::find()
            .select_only()
            .columns(Self::Column::iter())
            .filter(
                Condition::any()
                    .add(Self::category_column().is_null())
                    .add(Self::category_column().is_in(categories.clone())),
            )
            .filter(
                Condition::any()
                    .add(Self::classification_column().is_null())
                    .add(Self::classification_column().is_in(classifications.clone())),
            )
            .apply_if(start_date, |query, value| {
                query.filter(Self::booking_date_column().gte(value))
            })
            .apply_if(end_date, |query, value| {
                query.filter(Self::booking_date_column().lte(value))
            })
            .apply_if(transaction_id, |query, value| {
                query.filter(Self::id_column().eq(value))
            })
            .apply_if(
                Self::auto_category_column(),
                |query, auto_category_column| {
                    query
                        .filter(
                            Condition::any()
                                .add(auto_category_column.is_null())
                                .add(auto_category_column.is_in(categories)),
                        )
                        .column_as(
                            Expr::cust_with_exprs(
                                "COALESCE($1, $2)",
                                [
                                    Expr::col(Self::category_column()),
                                    Expr::col(auto_category_column),
                                ],
                            ),
                            Self::category_column(),
                        )
                },
            )
            .apply_if(
                Self::auto_classification_column(),
                |query, auto_classification_column| {
                    query
                        .filter(
                            Condition::any()
                                .add(auto_classification_column.is_null())
                                .add(auto_classification_column.is_in(classifications)),
                        )
                        .column_as(
                            Expr::cust_with_exprs(
                                "COALESCE($1, $2)",
                                [
                                    Expr::col(Self::classification_column()),
                                    Expr::col(auto_classification_column),
                                ],
                            ),
                            Self::classification_column(),
                        )
                },
            )
            .order_by_desc(Self::booking_date_column())
            .all(db)
            .await
    }

    /// Get transactions time-aggregated.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the query fails.
    async fn get_transactions_time_aggregated<C>(
        db: &C,
        start_date: Option<Date>,
        end_date: Option<Date>,
        aggregation: TimeAggregation,
    ) -> Result<Vec<AggregatedResult>, DbErr>
    where
        C: ConnectionTrait,
    {
        let date_trunc_expr = match aggregation {
            TimeAggregation::Daily => Expr::cust_with_expr(
                "DATE_TRUNC('day', $1)",
                Expr::col(Self::booking_date_column()),
            ),
            TimeAggregation::Weekly => Expr::cust_with_expr(
                "DATE_TRUNC('week', $1)",
                Expr::col(Self::booking_date_column()),
            ),
            TimeAggregation::Monthly => Expr::cust_with_expr(
                "DATE_TRUNC('month', $1)",
                Expr::col(Self::booking_date_column()),
            ),
        };

        Self::find()
            .select_only()
            .apply_if(start_date, |query, value| {
                query.filter(Self::booking_date_column().gte(value))
            })
            .apply_if(end_date, |query, value| {
                query.filter(Self::booking_date_column().lte(value))
            })
            .column_as(date_trunc_expr.clone().cast_as("date"), "date")
            // TODO: how to get away from this CASTING madness?
            .column_as(
                Expr::expr(Func::round_with_precision(
                    Self::amount_column().sum().cast_as("numeric"),
                    2,
                ))
                .cast_as("double precision"),
                "amount",
            )
            .group_by(date_trunc_expr.clone())
            .order_by_asc(date_trunc_expr)
            .into_model()
            .all(db)
            .await
    }
}

/// An abstract base class for a projection supporting user settings.
#[async_trait::async_trait]
pub trait AutoUserSettingTrait: EntityTrait {
    /// Auto-category column
    fn auto_category_column() -> Self::Column;

    /// Auto-classification column
    fn auto_classification_column() -> Self::Column;

    /// Target column to apply regex rules on.
    fn regex_rule_target_column() -> Self::Column;

    /// Apply the regex rules from user settings to the whole table.
    ///
    /// First, set "auto_category" and "auto_classification" columns in the database to be NULL
    /// and apply the user settings one by one over those two columns.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if any step of the operation fails.
    #[instrument(skip(db, user_settings))]
    async fn apply_user_settings_all<C>(
        db: &C,
        user_settings: &[UserSettingsResult],
    ) -> Result<(), DbErr>
    where
        C: ConnectionTrait,
    {
        Self::update_many()
            .col_expr(
                Self::auto_category_column(),
                Expr::value(Option::<TransactionCategory>::None),
            )
            .col_expr(
                Self::auto_classification_column(),
                Expr::value(Option::<TransactionClassification>::None),
            )
            .exec(db)
            .await?;

        for setting in user_settings {
            Self::update_many()
                .col_expr(Self::auto_category_column(), Expr::value(setting.category))
                .col_expr(
                    Self::auto_classification_column(),
                    Expr::value(setting.classification),
                )
                .filter(Self::auto_category_column().is_null())
                .filter(Self::auto_classification_column().is_null())
                .filter(Expr::cust_with_exprs(
                    "$1 ~ $2",
                    [
                        Expr::col(Self::regex_rule_target_column()),
                        Expr::value(setting.regex_rule.as_str()),
                    ],
                ))
                .exec(db)
                .await?;
        }

        info!(
            n_settings = user_settings.len(),
            "applied user settings to expenses projection"
        );

        Ok(())
    }
}
