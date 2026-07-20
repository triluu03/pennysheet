//! Transaction import

use chrono::{
    Duration,
    Local,
    NaiveDate,
    NaiveTime,
};
use domain::{
    aggregates::CoreAggregate,
    commands::{
        Command,
        GatewayCommand,
    },
    errors::DomainError,
    event_injectors::EventInjector,
    events::{
        Event,
        transactions::ImportStatusData,
    },
    process_managers::transaction::TransactionProcessManager,
};
use gateway::client::enable_banking_client::EnableBankingClient;
use infra::{
    DatabaseConnection,
    SessionData,
    append_event_to_db,
    append_multi_events_to_db,
    get_all_events,
    get_all_sessions,
};
use tracing::{
    error,
    info,
    instrument,
};
use uuid::Uuid;

use crate::errors::AppError;

/// Scheduled-polling of the Enable Banking API.
///
/// This task is meant to be run in the background.
#[instrument(skip(db))]
pub async fn scheduled_transaction_import(db: DatabaseConnection) {
    let noon = NaiveTime::from_hms_opt(12, 0, 0).unwrap();
    let evening = NaiveTime::from_hms_opt(20, 0, 0).unwrap();
    let scheduled_times = [noon, evening];

    let mut last_run: Option<(NaiveDate, NaiveTime)> = None;

    loop {
        // Check against wall-clock every 1 minute.
        tokio::time::sleep(std::time::Duration::from_secs(60)).await;

        let now = Local::now();
        let today = now.date_naive();
        let current_time = now.time();

        let next_run: Option<NaiveTime> = scheduled_times
            .iter()
            .find(|target| {
                current_time >= **target
                    //  Run request within 5-minute window
                    && current_time < **target + Duration::minutes(5)
                    && last_run != Some((today, **target))
            })
            .copied();

        if let Some(target) = next_run {
            info!(time = target.to_string(), "running the scheduled import");
            last_run = Some((today, target));
            match run_scheduled_polling_job(&db).await {
                Ok(()) => info!("scheduled transactions import completed"),
                Err(error) => error!(%error, "scheduled transactions import failed"),
            }
        }
    }
}

/// Run the scheduled polling job.
///
/// NOTE: this function has quite many overlapping features with the
/// [`crate::handlers::import_transactions_handler`].
/// TODO: consider refactoring them into one helper function to avoid duplicate maintenance.
#[instrument(skip(db))]
async fn run_scheduled_polling_job(db: &DatabaseConnection) -> Result<(), AppError> {
    let (valid_sessions, expired_sessions) = get_all_sessions(db).await?;
    if !expired_sessions.is_empty() {
        error!(
            n_expired = expired_sessions.len(),
            "skipping scheduled import due to expired sessions"
        );
        return Err(AppError::ExpiredSession);
    };

    let today = Local::now().date_naive();
    let last_week = today - Duration::days(7);

    let commands = Command::create_import_transactions(
        Some(&last_week.to_string()),
        Some(&today.to_string()),
        valid_sessions
            .iter()
            .map(|session_data| session_data.session_id)
            .collect(),
    )?;

    let all_events = get_all_events(db).await?;
    let aggregate = CoreAggregate::new(&all_events);

    // NOTE: here, the aggregate doesn't consume the emitted event before executing a new command.
    // This is find in this case as these events are independent, but it does not fully respect the
    // design and concepts of an event-sourcing system.
    let events = commands
        .into_iter()
        .map(|command| aggregate.execute(command))
        .collect::<Result<Vec<Event>, DomainError>>()?;

    let _res = append_multi_events_to_db(db, events.clone()).await?;
    info!(
        n_requests = events.len(),
        n_sessions = valid_sessions.len(),
        "scheduled import transactions requested"
    );

    // Spawn background jobs running transaction process managers.
    events.iter().for_each(|event| {
        if let Event::ImportTransactionsRequested(data) = &event
            && let Some(session) = valid_sessions
                .iter()
                .find(|session_data| session_data.session_id == data.session_id)
        {
            tokio::spawn(run_transaction_import(
                db.to_owned(),
                session.to_owned(),
                data.request_id,
            ));
        }
    });

    Ok(())
}

/// Run a transaction import.
///
/// This task is meant to be run in the background to avoid blocking the clients.
#[instrument(skip(db, session_data), fields(%request_id, %session_id = session_data.session_id))]
pub async fn run_transaction_import(
    db: DatabaseConnection,
    session_data: SessionData,
    request_id: Uuid,
) {
    info!("starting transaction import");
    let client = match EnableBankingClient::new(session_data.enable_banking_session) {
        Ok(client) => client,
        Err(error) => {
            return fail_import(
                &db,
                request_id,
                session_data.session_id,
                "init Enable Banking client",
                &error.to_string(),
            )
            .await;
        },
    };

    let current_event_table = match get_all_events(&db).await {
        Ok(events) => events,
        Err(error) => {
            return fail_import(
                &db,
                request_id,
                session_data.session_id,
                "get the current event table",
                &error.to_string(),
            )
            .await;
        },
    };

    let mut manager =
        match TransactionProcessManager::new(session_data.session_id, &current_event_table) {
            Ok(manager) => manager,
            Err(error) => {
                return fail_import(
                    &db,
                    request_id,
                    session_data.session_id,
                    "init transaction process manager",
                    &error.to_string(),
                )
                .await;
            },
        };

    let mut injector = match EventInjector::new(session_data.session_id, &current_event_table) {
        Ok(injector) => injector,
        Err(error) => {
            return fail_import(
                &db,
                request_id,
                session_data.session_id,
                "init event injector",
                &error.to_string(),
            )
            .await;
        },
    };

    loop {
        let gateway_query_params = match manager.create_gateway_command() {
            Ok(GatewayCommand::ImportTransactions(query_params)) => query_params,
            Err(error) => {
                return fail_import(
                    &db,
                    request_id,
                    session_data.session_id,
                    "issue gateway command",
                    &error.to_string(),
                )
                .await;
            },
        };

        let response = match client.get_transactions(gateway_query_params).await {
            Ok(response) => response,
            Err(error) => {
                return fail_import(
                    &db,
                    request_id,
                    session_data.session_id,
                    "fetch transactions",
                    &error.to_string(),
                )
                .await;
            },
        };

        let new_events = match injector.inject_transaction_events(response) {
            Ok(new_events) => new_events,
            Err(error) => {
                return fail_import(
                    &db,
                    request_id,
                    session_data.session_id,
                    "inject events from response",
                    &error.to_string(),
                )
                .await;
            },
        };

        // Let process managers and event injectors consume new events.
        manager = manager.multi_apply(&new_events);
        injector = injector.multi_apply(&new_events);

        let completed_event = new_events
            .iter()
            .find(|event| matches!(event, Event::ImportTransactionsCompleted(_)))
            .cloned();
        let failed_event = new_events
            .iter()
            .find(|event| matches!(event, Event::ImportTransactionsFailed(_)))
            .cloned();

        info!(n_events = new_events.len(), "appending imported events");
        if let Err(error) = append_multi_events_to_db(&db, new_events).await {
            return fail_import(
                &db,
                request_id,
                session_data.session_id,
                "inject new events",
                &error.to_string(),
            )
            .await;
        }

        if completed_event.is_some() {
            info!("transaction import completed");
            return;
        }
        if failed_event.is_some() {
            error!("transaction import ended with failure event");
            return;
        }
    }
}

/// Record a failed import.
///
/// Append an [`Event::ImportTransactionsFailed`] and log the cause.
async fn fail_import(
    db: &DatabaseConnection,
    request_id: Uuid,
    session_id: i64,
    context: &str,
    error: &str,
) {
    error!(%request_id, context, error, "transaction import failed");

    let failed_event = Event::ImportTransactionsFailed(ImportStatusData {
        request_id,
        session_id,
    });
    if let Err(error) = append_event_to_db(db, failed_event).await {
        error!(
            %request_id,
            %session_id,
            %error,
            "failed to append ImportTransactionsFailed event",
        );
    }
}

// TODO: add tests for fail_import, run_transaction_import, and run_scheduled_polling_job once
// Enable Banking/JWT fixtures are available without new dependencies.
