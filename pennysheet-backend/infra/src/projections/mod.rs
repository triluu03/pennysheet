//! Projections.

use domain::events::{
    TransactionCategory,
    TransactionClassification,
};
use sea_orm::{
    ColumnTrait,
    ConnectionTrait,
    DbErr,
    EntityTrait,
    QueryFilter,
    QueryOrder,
    QueryTrait,
    entity::prelude::*,
    prelude::{
        Expr,
        async_trait,
    },
    sea_query::SimpleExpr,
};
use uuid::Uuid;

pub mod expenses;
pub mod income;
pub(crate) mod projector_states;
pub mod transactions;

/// An abstract base class for a transaction-related projection.
#[async_trait::async_trait]
pub trait TransactionProjectionTrait: EntityTrait {
    /// Transaction ID column.
    fn id_column() -> Self::Column;

    /// Booking date column.
    fn booking_date_column() -> Self::Column;

    /// Category column
    fn category_column() -> Self::Column;

    /// Classification column
    fn classification_column() -> Self::Column;

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
    ) -> Result<Vec<Self::Model>, DbErr>
    where
        C: ConnectionTrait,
    {
        Self::find()
            .apply_if(start_date, |query, value| {
                query.filter(Self::booking_date_column().gt(value))
            })
            .apply_if(end_date, |query, value| {
                query.filter(Self::booking_date_column().lt(value))
            })
            .apply_if(transaction_id, |query, value| {
                query.filter(Self::id_column().eq(value))
            })
            .order_by_asc(Self::booking_date_column())
            .all(db)
            .await
    }
}
