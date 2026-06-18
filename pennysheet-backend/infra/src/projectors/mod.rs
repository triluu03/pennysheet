//! Projectors

use domain::events::Event;
use sea_orm::{
    ActiveModelTrait,
    DatabaseConnection,
    DatabaseTransaction,
    DbErr,
    TransactionTrait,
};
use sqlx::postgres::PgListener;
use tracing::{
    info,
    instrument,
};

use crate::{
    get_database_url,
    get_events_with_offset,
    projections::{
        TransactionProjectionTrait,
        expenses,
        income,
        projector_states::{
            get_projector_state,
            update_projector_state,
        },
        transactions,
    },
};

/// Project to all projections that implements [`TransactionProjectionTrait`].
macro_rules! project_to_all {
    ($method:ident, $txn:expr, $id:expr, $value:expr) => {{
        transactions::Entity::$method($txn, $id, $value).await?;
        expenses::Entity::$method($txn, $id, $value).await?;
        income::Entity::$method($txn, $id, $value).await?;
    }};
}

const PROJECTOR_NAME: &str = "CoreProjector";

#[derive(Debug, Clone)]
pub struct CoreProjector<'db> {
    db: &'db DatabaseConnection,
    name: String,
    last_seen_event_number: i64,
}

impl<'db> CoreProjector<'db> {
    /// Construct a [`CoreProjector`] from a [`DatabaseConnection`] reference.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if fails to get the projector state from the database.
    #[instrument(skip(db))]
    pub async fn new(db: &'db DatabaseConnection) -> Result<Self, DbErr> {
        let last_seen_event_number = get_projector_state(db, PROJECTOR_NAME).await?.unwrap_or(0);
        info!("projector initialized");
        Ok(Self {
            db,
            name: PROJECTOR_NAME.to_string(),
            last_seen_event_number,
        })
    }

    /// Listen to new events appended and run the projections.
    ///
    /// This function runs in an inifinite loop and is only meant to be used
    /// within a separate Tokio's async task.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the listener crashes or the projections fails.
    #[instrument(skip(self))]
    pub async fn listen_to_new_events(&mut self) -> Result<(), DbErr> {
        let (database_url, db_name) = get_database_url()?;

        let mut listener = PgListener::connect(&format!("{database_url}/{db_name}"))
            .await
            .map_err(|err| DbErr::Custom(format!("Failed to connect PgListener: {}", err)))?;

        listener.listen("EventStore").await.map_err(|err| {
            DbErr::Custom(format!("Failed to listen to the event table: {}", err))
        })?;

        // Refresh any unseen events appended while the project was not online.
        info!("trigger a projection run to clear the backlog");
        self.run_projections().await?;

        // Subscribe to notifications from the event table.
        loop {
            match listener.recv().await {
                Ok(notification) => {
                    if notification.payload() == "new-events-appended" {
                        self.run_projections().await?;
                    }
                },
                Err(e) => {
                    return Err(DbErr::Custom(format!("Listener crashed: {}", e)));
                },
            }
        }
    }

    /// Run projections.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the projections fails.
    #[instrument(skip(self))]
    pub async fn run_projections(&mut self) -> Result<(), DbErr> {
        let unseen_events = get_events_with_offset(self.db, self.last_seen_event_number).await?;
        let n_unseen_events: i64 = unseen_events
            .len()
            .try_into()
            .map_err(|err| DbErr::Custom(format!("Failed to parse usize into i64: {}", err)))?;

        info!(n_unseen_events, "projecting unseen events in a transaction");
        let txn = self.db.begin().await?;
        CoreProjector::multi_project(&txn, &unseen_events).await?;
        update_projector_state(
            &txn,
            &self.name,
            self.last_seen_event_number + n_unseen_events,
        )
        .await?;
        txn.commit().await?;

        // Update the state of the current spawned projector.
        self.last_seen_event_number += n_unseen_events;
        info!("projection transaction committed");
        Ok(())
    }

    /// Project records based on one event.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if the insertion into the projection fails.
    #[instrument(skip(txn))]
    async fn project(txn: &DatabaseTransaction, event: &Event) -> Result<(), DbErr> {
        match event {
            Event::TransactionRecorded(data) => {
                transactions::ActiveModel::from_recorded_transaction(data.clone())
                    .insert(txn)
                    .await?;

                if let Some(expense) =
                    expenses::ActiveModel::from_recorded_transaction(data.clone())
                {
                    expense.insert(txn).await?;
                };
                if let Some(income) = income::ActiveModel::from_recorded_transaction(data.clone()) {
                    income.insert(txn).await?;
                };

                Ok(())
            },
            Event::TransactionCategorized(data) => {
                project_to_all!(update_category, txn, data.transaction_id, data.category);
                Ok(())
            },
            Event::TransactionClassified(data) => {
                project_to_all!(
                    update_classification,
                    txn,
                    data.transaction_id,
                    data.classification
                );
                Ok(())
            },
            Event::TransactionNoteUpdated(data) => {
                project_to_all!(update_note, txn, data.transaction_id, data.note.clone());
                Ok(())
            },
            Event::ImportTransactionsContinued(_)
            | Event::ImportTransactionsRequested(_)
            | Event::ImportTransactionsCompleted(_)
            | Event::TransactionImportRetryRequested(_)
            | Event::ImportTransactionsFailed(_) => {
                // Skip these events.
                Ok(())
            },
        }
    }

    /// Project records based on multiple events.
    ///
    /// # Errors
    ///
    /// Returns [`DbErr`] if any insertion into the projection fails.
    #[instrument(skip(txn))]
    async fn multi_project(txn: &DatabaseTransaction, events: &[Event]) -> Result<(), DbErr> {
        for event in events.iter() {
            CoreProjector::project(txn, event).await?
        }
        Ok(())
    }
}
