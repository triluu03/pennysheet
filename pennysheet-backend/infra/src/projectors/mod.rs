//! Projectors

use domain::events::Event;
use sea_orm::{
    ActiveModelTrait,
    DatabaseConnection,
    DatabaseTransaction,
    DbErr,
    TransactionTrait,
};
use tracing::{
    info,
    instrument,
};

use crate::{
    get_events_with_offset,
    projections::{
        projector_states::{
            get_projector_state,
            update_projector_state,
        },
        transactions,
    },
};

#[derive(Debug, Clone)]
pub struct CoreProjector<'a> {
    db: &'a DatabaseConnection,
    name: String,
    last_seen_event_number: i64,
}

impl<'a> CoreProjector<'a> {
    /// Construct a [`CoreProjector`] from a [`DatabaseConnection`] reference.
    ///
    /// # Errors
    /// Returns [`DbErr`] if fails to get the projector state from the database.
    #[instrument(skip(db))]
    pub async fn new(db: &'a DatabaseConnection) -> Result<Self, DbErr> {
        let last_seen_event_number = get_projector_state(db, "CoreProjector").await?.unwrap_or(0);
        info!("projector initialized");
        Ok(Self {
            db,
            name: "CoreProjector".to_string(),
            last_seen_event_number,
        })
    }

    /// Run projections.
    ///
    /// # Errors
    /// Returns [`DbErr`] if the projections fails.
    #[instrument(skip(self))]
    pub async fn run_projections(&self) -> Result<(), DbErr> {
        let unseen_events = get_events_with_offset(
            self.db,
            self.last_seen_event_number.try_into().map_err(|_| {
                DbErr::Custom("last_seen_event_number is a negative value".to_string())
            })?,
        )
        .await?;
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

        info!("projection transaction committed");
        Ok(())
    }

    /// Project records based on one event.
    ///
    /// # Errors
    /// Returns [`DbErr`] if the insertion into the projection fails.
    #[instrument(skip(txn))]
    async fn project(txn: &DatabaseTransaction, event: &Event) -> Result<(), DbErr> {
        match event {
            Event::TransactionRecorded(data) => {
                let _ = transactions::ActiveModel::from_recorded_transaction(data.clone())
                    .insert(txn)
                    .await?;
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
    /// Returns [`DbErr`] if any insertion into the projection fails.
    #[instrument(skip(txn))]
    async fn multi_project(txn: &DatabaseTransaction, events: &[Event]) -> Result<(), DbErr> {
        for event in events.iter() {
            CoreProjector::project(txn, event).await?
        }
        Ok(())
    }
}
