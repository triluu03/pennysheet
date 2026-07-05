//! Expenses projections.

use domain::events::{
    TransactionCategory,
    TransactionClassification,
    transactions::TransactionData,
};
use regex::Regex;
use sea_orm::{
    ActiveValue::Set,
    DbBackend,
    ExprTrait,
    FromQueryResult,
    Iterable,
    Order,
    Statement,
    entity::prelude::*,
    sea_query::{
        Alias,
        CommonTableExpression,
        PostgresQueryBuilder,
        Query,
        WithClause,
    },
};
use serde::Serialize;
use std::str::FromStr;
use tracing::{
    info,
    instrument,
};

use crate::{
    projections::TransactionProjectionTrait,
    user_settings::UserSettingsResult,
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
        Some(self::Column::AutoCategory)
    }
    fn classification_column() -> Self::Column {
        self::Column::Classification
    }
    fn auto_classification_column() -> Option<Self::Column> {
        Some(self::Column::AutoClassification)
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
            .filter(Column::AutoCategory.is_null())
            .filter(Column::AutoClassification.is_null())
            .filter(Expr::cust_with_exprs(
                "$1 ~ $2",
                [
                    Expr::col(Column::CreditorName),
                    Expr::value(setting.regex_rule.as_str()),
                ],
            ))
            .exec(db)
            .await?;
    }

    Ok(())
}

#[derive(Debug, Serialize, FromQueryResult)]
#[allow(non_snake_case)]
pub struct PivotRow {
    pub date: Date,
    // Categories
    pub Groceries: f64,
    pub Health: f64,
    pub Transport: f64,
    pub Services: f64,
    pub Leisure: f64,
    pub Others: f64,
    pub Uncategorized: f64,
    // Classification
    #[serde(rename = "must-have")]
    pub must_have: f64,
    #[serde(rename = "nice-to-have")]
    pub nice_to_have: f64,
    pub wasted: f64,
    pub unclassified: f64,
}

/// Get transactions pivot table.
///
/// # Errors
///
/// Returns [`DbErr`] if the query fails.
#[instrument(skip(db))]
pub async fn get_expenses_pivot_table<C>(
    db: &C,
    start_date: Option<Date>,
    end_date: Option<Date>,
    categories: Vec<TransactionCategory>,
    classifications: Vec<TransactionClassification>,
) -> Result<Vec<PivotRow>, DbErr>
where
    C: ConnectionTrait,
{
    let coalsce_query = Query::select()
        .column(Column::BookingDate)
        .expr_as(
            Expr::cust_with_exprs(
                "COALESCE($1, $2)",
                [Expr::col(Column::Category), Expr::col(Column::AutoCategory)],
            ),
            Column::Category,
        )
        .expr_as(
            Expr::cust_with_exprs(
                "COALESCE($1, $2)",
                [
                    Expr::col(Column::Classification),
                    Expr::col(Column::AutoClassification),
                ],
            ),
            Column::Classification,
        )
        .column(Column::Amount)
        .from(Entity)
        .apply_if(start_date, |query, value| {
            query.and_where(Expr::col(Column::BookingDate).gte(value));
        })
        .apply_if(end_date, |query, value| {
            query.and_where(Expr::col(Column::BookingDate).lte(value));
        })
        .to_owned();

    let coalsce_table = CommonTableExpression::new()
        .query(coalsce_query)
        .table_name(Alias::new("coalesce_table"))
        .to_owned();

    let date_trunc_expr =
        Expr::cust_with_expr("DATE_TRUNC('month', $1)", Expr::col(Column::BookingDate));

    // Build the main query
    let mut select_query = Query::select();
    select_query
        .expr_as(date_trunc_expr.clone().cast_as("date"), "date")
        .from("coalesce_table")
        .and_where(Expr::col("category").is_in(categories))
        .and_where(Expr::col("classification").is_in(classifications))
        .add_group_by([date_trunc_expr.clone()])
        .order_by_expr(date_trunc_expr, Order::Asc);

    // Loop through each category and calculate the total for each of them.
    for category in TransactionCategory::iter() {
        select_query.expr_as(
            // TODO: simplify this nested functions queries.
            Expr::cust(format!(
                "ROUND(COALESCE(SUM(amount) FILTER (WHERE category = '{}'), 0)::NUMERIC, \
                 2)::DOUBLE PRECISION",
                category.into_value()
            )),
            category.into_value(),
        );
    }
    select_query.expr_as(
        // TODO: simplify this nested functions queries.
        Expr::cust(
            "ROUND(COALESCE(SUM(amount) FILTER (WHERE category IS NULL), 0)::NUMERIC, 2)::DOUBLE \
             PRECISION",
        ),
        "Uncategorized",
    );

    // Loop through each classification and calculate the total for each of them.
    for classification in TransactionClassification::iter() {
        select_query.expr_as(
            // TODO: simplify this nested functions queries.
            Expr::cust(format!(
                "ROUND(COALESCE(SUM(amount) FILTER (WHERE classification = '{}'), 0)::NUMERIC, \
                 2)::DOUBLE PRECISION",
                classification.into_value()
            )),
            classification.into_value().replace('-', "_"),
        );
    }
    select_query.expr_as(
        // TODO: simplify this nested functions queries.
        Expr::cust(
            "ROUND(COALESCE(SUM(amount) FILTER (WHERE classification IS NULL), 0)::NUMERIC, \
             2)::DOUBLE PRECISION",
        ),
        "unclassified",
    );

    let (sql, values) = select_query
        .with(WithClause::new().cte(coalsce_table).to_owned())
        .build(PostgresQueryBuilder);

    let rows = PivotRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &sql,
        values,
    ))
    .all(db)
    .await?;

    Ok(rows)
}
