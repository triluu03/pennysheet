//! Scheduled budget-reset and daily budget-status background jobs.
//!
//! ## Budget reset
//! Resets active budgets on a fixed schedule:
//! - **Weekly** budget resets every Sunday evening; the new `start_date` is the following Monday.
//! - **Monthly** budget resets on the last calendar day of the month; the new `start_date` is the
//!   first day of the next month.
//!
//! ## Daily budget-status notification
//! A summary of remaining weekly and monthly budget amounts is sent twice daily
//! at 8:30 AM and 3:30 PM local time via Telegram.

use chrono::{
    Datelike,
    Duration,
    Local,
    NaiveDate,
    NaiveTime,
    Weekday,
};
use domain::{
    aggregates::CoreAggregate,
    commands::Command,
    events::budgets::BudgetType,
    process_managers::budget::BudgetProcessManager,
};
use gateway::{
    client::{
        enable_banking_client::EnableBankingClient,
        telegram_bot_client::TelegramBotClient,
    },
    schema::enable_banking_api::balance::BalanceResource,
};
use infra::{
    DatabaseConnection,
    append_event_to_db,
    get_all_events,
    get_all_sessions,
};
use tracing::{
    error,
    info,
    instrument,
    warn,
};

use crate::errors::AppError;

/// Target wall-clock time for the daily schedule check (9 PM local).
const SCHEDULED_TIME: NaiveTime =
    NaiveTime::from_hms_opt(21, 0, 0).expect("hard-coded 21:00:00 must be a valid time");

/// Target wall-clock time for the morning budget-status notification (8:30 AM local).
const MORNING_STATUS_SCHEDULED_TIME: NaiveTime =
    NaiveTime::from_hms_opt(8, 30, 0).expect("hard-coded 08:30:00 must be a valid time");

/// Target wall-clock time for the afternoon budget-status notification (3:30 PM local).
const AFTERNOON_STATUS_SCHEDULED_TIME: NaiveTime =
    NaiveTime::from_hms_opt(15, 30, 0).expect("hard-coded 15:30:00 must be a valid time");

/// Width of the window (in minutes) after a target time during which
/// scheduled background jobs are eligible to fire.
const WINDOW_MINUTES: i64 = 5;

/// Scheduled-polling loop that resets budgets on their cadence.
///
/// Checks once per minute whether the current wall-clock time triggers a
/// weekly or monthly reset. After a reset fires for a given target time on a
/// given date, that target is skipped until the next day.
///
/// This task is meant to be run in the background via `tokio::spawn`.
#[instrument(skip(db))]
pub async fn scheduled_budget_reset(db: DatabaseConnection) {
    // Track which (date, variant) pairs have already been processed to avoid
    // duplicate firings within the same window.
    let mut last_run_weekly: Option<NaiveDate> = None;
    let mut last_run_monthly: Option<NaiveDate> = None;

    loop {
        tokio::time::sleep(std::time::Duration::from_secs(60)).await;

        let now = Local::now();
        let today = now.date_naive();

        if is_sunday_evening(now) && last_run_weekly != Some(today) {
            info!("triggering weekly budget reset");
            let new_start = next_monday(today);
            match run_budget_reset_job(&db, BudgetType::Weekly, &new_start.to_string()).await {
                Ok(()) => {
                    info!(%new_start, "weekly budget reset completed");
                    last_run_weekly = Some(today);
                },
                Err(error) => error!(%error, "weekly budget reset failed"),
            }
        }

        if is_last_day_of_month(now) && last_run_monthly != Some(today) {
            info!("triggering monthly budget reset");
            let new_start = first_of_next_month(today);
            match run_budget_reset_job(&db, BudgetType::Monthly, &new_start.to_string()).await {
                Ok(()) => {
                    info!(%new_start, "monthly budget reset completed");
                    last_run_monthly = Some(today);
                },
                Err(error) => error!(%error, "monthly budget reset failed"),
            }
        }
    }
}

/// Execute a single budget-reset for the given `budget_type` and new
/// `start_date`.
///
/// Replays the full event table through the aggregate, issues a
/// [`Command::ResetBudget`], and appends the resulting event.
///
/// # Errors
///
/// Returns [`AppError`] if:
/// - The start date cannot be parsed (must be in `YYYY-MM-DD` format).
/// - The event table cannot be loaded.
/// - The aggregate rejects the reset command (e.g. no active budget).
/// - The event cannot be appended to the store.
#[instrument(skip(db), fields(%budget_type, %start_date))]
async fn run_budget_reset_job(
    db: &DatabaseConnection,
    budget_type: BudgetType,
    start_date: &str,
) -> Result<(), AppError> {
    let all_events = get_all_events(db).await?;
    let process_manager = BudgetProcessManager::new(&all_events)?;

    // Parse the new start_date for comparison against the current period.
    let new_start = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")
        .map_err(|e| AppError::Domain(e.into()))?;

    // If the current budget period hasn't started yet (its start_date is in
    // the future relative to the new start_date), skip the reset entirely.
    if let Some(current_start) = process_manager.start_date(budget_type)
        && current_start >= new_start
    {
        info!(
            %budget_type,
            %current_start,
            %new_start,
            "skipping budget reset: current budget period has not started yet"
        );
        return Ok(());
    }

    let previous_remaining = process_manager.remaining_amount(budget_type);

    let command = Command::create_reset_budget(new_start, budget_type, previous_remaining)?;
    let event = CoreAggregate::new(&all_events).execute(command)?;

    let res = append_event_to_db(db, event.clone()).await?;
    info!(
        event_id = %res.last_insert_id,
        %budget_type,
        %start_date,
        "budget reset by scheduled job"
    );

    Ok(())
}

/// Determine whether `now` falls on a Sunday evening inside the scheduled
/// window.
fn is_sunday_evening(now: chrono::DateTime<Local>) -> bool {
    if now.weekday() != Weekday::Sun {
        return false;
    }
    time_in_window(now.time(), SCHEDULED_TIME)
}

/// Determine whether `now` falls on the last calendar day of the month inside
/// the scheduled window.
fn is_last_day_of_month(now: chrono::DateTime<Local>) -> bool {
    let today = now.date_naive();
    let last_day = first_of_next_month(today).pred_opt().unwrap_or(today);
    if today != last_day {
        return false;
    }
    time_in_window(now.time(), SCHEDULED_TIME)
}

/// Return true when `t` is within [`scheduled`, `scheduled` +
/// [`WINDOW_MINUTES`]).
fn time_in_window(t: NaiveTime, scheduled: NaiveTime) -> bool {
    let window_end = scheduled + Duration::minutes(WINDOW_MINUTES);
    t >= scheduled && t < window_end
}

/// Compute the date of the Monday immediately following `today`.
///
/// When `today` is already a Monday the following Monday (7 days later) is
/// returned.
fn next_monday(today: NaiveDate) -> NaiveDate {
    // Mon=0, Tue=1, …, Sun=6. Advance to the next Monday (7 days if today is already Monday).
    let d = today.weekday().num_days_from_monday();
    let days = if d == 0 { 7 } else { 7 - d };
    today + Duration::days(i64::from(days))
}

/// Compute the first day of the month immediately following `today`.
///
/// Handles December → January year rollover.
fn first_of_next_month(today: NaiveDate) -> NaiveDate {
    let (y, m) = if today.month() == 12 {
        (today.year() + 1, 1)
    } else {
        (today.year(), today.month() + 1)
    };
    NaiveDate::from_ymd_opt(y, m, 1).expect("computed first-of-month is always valid")
}

/// Scheduled-polling loop that sends a budget-status summary via Telegram twice
/// daily at 8:30 AM and 3:30 PM local time.
///
/// Checks once per minute whether the current wall-clock time triggers either
/// daily notification. After a notification fires for a given date and window,
/// that window is skipped until the next day.
///
/// This task is meant to be run in the background via `tokio::spawn`.
#[instrument(skip(db))]
pub async fn scheduled_budget_status_notification(db: DatabaseConnection) {
    let mut last_run_morning: Option<NaiveDate> = None;
    let mut last_run_afternoon: Option<NaiveDate> = None;

    loop {
        tokio::time::sleep(std::time::Duration::from_secs(60)).await;

        let now = Local::now();
        let today = now.date_naive();

        if time_in_window(now.time(), MORNING_STATUS_SCHEDULED_TIME)
            && last_run_morning != Some(today)
        {
            info!("triggering morning budget status notification");
            match run_budget_status_job(&db).await {
                Ok(()) => {
                    info!("morning budget status notification sent");
                    last_run_morning = Some(today);
                },
                Err(error) => warn!(%error, "morning budget status notification failed"),
            }
        }

        if time_in_window(now.time(), AFTERNOON_STATUS_SCHEDULED_TIME)
            && last_run_afternoon != Some(today)
        {
            info!("triggering afternoon budget status notification");
            match run_budget_status_job(&db).await {
                Ok(()) => {
                    info!("afternoon budget status notification sent");
                    last_run_afternoon = Some(today);
                },
                Err(error) => warn!(%error, "afternoon budget status notification failed"),
            }
        }
    }
}

/// Execute a single budget-status notification.
///
/// Replays the full event table through
/// [`BudgetProcessManager`], builds a status message via
/// [`BudgetProcessManager::create_gateway_command`], and sends it
/// through [`TelegramBotClient`].
///
/// # Errors
///
/// Returns [`AppError`] if:
/// - The event table cannot be loaded.
/// - The process manager cannot be initialised (no active budgets).
/// - The gateway command cannot be created.
/// - The Telegram client cannot send the message.
#[instrument(skip(db))]
async fn run_budget_status_job(db: &DatabaseConnection) -> Result<(), AppError> {
    let all_events = get_all_events(db).await?;
    let process_manager = BudgetProcessManager::new(&all_events)?;
    let command = process_manager.create_gateway_command(Local::now().date_naive())?;

    let mut body = match command {
        domain::commands::GatewayCommand::SendTelegramMessage(body) => body,
        _ => {
            return Err(AppError::Domain(
                domain::errors::DomainError::CommandCreation(
                    "expected SendTelegramMessage command".to_string(),
                ),
            ));
        },
    };

    let mut bank_balances: Vec<(String, BalanceResource)> = Vec::new();
    let mut balance_fetch_failed = false;

    match get_all_sessions(db).await {
        Ok((valid_sessions, _expired_sessions)) => {
            if valid_sessions.is_empty() {
                body.push_str("\n\n💰 <b>Bank Balance</b>\nNo connected accounts");
            } else {
                for session_data in valid_sessions {
                    let session_name = session_data.session_name.clone();
                    match EnableBankingClient::new(session_data.enable_banking_session.clone()) {
                        Ok(client) => match client.get_account_balances().await {
                            Ok(response) => bank_balances.extend(
                                response
                                    .balances
                                    .into_iter()
                                    .map(|balance| (session_name.clone(), balance)),
                            ),
                            Err(error) => {
                                warn!(
                                    session_id = %session_data.session_id,
                                    %error,
                                    "failed to fetch bank balance"
                                );
                                balance_fetch_failed = true;
                            },
                        },
                        Err(error) => {
                            warn!(
                                session_id = %session_data.session_id,
                                %error,
                                "failed to initialise Enable Banking client"
                            );
                            balance_fetch_failed = true;
                        },
                    }
                }

                if !bank_balances.is_empty() {
                    body.push_str("\n\n");
                    body.push_str(&format_bank_balance_section(&bank_balances));
                } else if balance_fetch_failed {
                    body.push_str("\n\n💰 <b>Bank Balance</b>\nCould not fetch balance");
                }
            }
        },
        Err(error) => {
            warn!(%error, "failed to load Enable Banking sessions");
            body.push_str("\n\n💰 <b>Bank Balance</b>\nCould not fetch balance");
        },
    }

    let client = TelegramBotClient::new_from_env()?;
    client.send_message(&body).await?;

    Ok(())
}

/// Format the bank-balance section appended to the budget-status message.
///
/// Emits a heading followed by one line per balance in the form
/// `<session_name>: <amount> <currency>`. External values are HTML-escaped
/// because the surrounding Telegram message is sent with `parse_mode: "HTML"`.
fn format_bank_balance_section(balances: &[(String, BalanceResource)]) -> String {
    let mut section = String::from("💰 <b>Bank Balance</b>");
    for (session_name, balance) in balances {
        section.push_str(&format!(
            "\n{}: {} {}",
            escape_html(session_name),
            escape_html(&balance.balance_amount.amount),
            escape_html(&balance.balance_amount.currency)
        ));
    }
    section
}

/// Escape the HTML special characters that Telegram `parse_mode: "HTML"`
/// interprets, so external values render literally.
fn escape_html(value: &str) -> String {
    let mut escaped = String::with_capacity(value.len());
    for ch in value.chars() {
        match ch {
            '&' => escaped.push_str("&amp;"),
            '<' => escaped.push_str("&lt;"),
            '>' => escaped.push_str("&gt;"),
            _ => escaped.push(ch),
        }
    }
    escaped
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{
        Local,
        NaiveDate,
        TimeZone,
    };

    /// Returns true for a Sunday at exactly 21:00 local time.
    #[test]
    fn is_sunday_evening_true_on_sunday_at_scheduled_time() {
        // 2026-01-18 is a Sunday.
        let dt = Local.with_ymd_and_hms(2026, 1, 18, 21, 0, 0).unwrap();
        assert!(is_sunday_evening(dt));
    }

    /// Returns false for a Sunday outside the 5-minute window.
    #[test]
    fn is_sunday_evening_false_outside_window() {
        let dt = Local.with_ymd_and_hms(2026, 1, 18, 21, 6, 0).unwrap();
        assert!(!is_sunday_evening(dt));
    }

    /// Returns false for a non-Sunday at 21:00.
    #[test]
    fn is_sunday_evening_false_on_non_sunday() {
        // 2026-01-19 is a Monday.
        let dt = Local.with_ymd_and_hms(2026, 1, 19, 21, 0, 0).unwrap();
        assert!(!is_sunday_evening(dt));
    }

    /// Returns true on the last day of a 31-day month at 21:00.
    #[test]
    fn is_last_day_of_month_true_on_31st() {
        let dt = Local.with_ymd_and_hms(2026, 1, 31, 21, 0, 0).unwrap();
        assert!(is_last_day_of_month(dt));
    }

    /// Returns true on Feb 28 of a non-leap year at 21:00.
    #[test]
    fn is_last_day_of_month_true_on_feb_28_non_leap() {
        // 2025 is not a leap year.
        let dt = Local.with_ymd_and_hms(2025, 2, 28, 21, 0, 0).unwrap();
        assert!(is_last_day_of_month(dt));
    }

    /// Returns false on a day that is not the last day of the month.
    #[test]
    fn is_last_day_of_month_false_on_non_last_day() {
        let dt = Local.with_ymd_and_hms(2026, 1, 15, 21, 0, 0).unwrap();
        assert!(!is_last_day_of_month(dt));
    }

    /// Returns false on the last day but outside the time window.
    #[test]
    fn is_last_day_of_month_false_outside_window() {
        let dt = Local.with_ymd_and_hms(2026, 1, 31, 21, 6, 0).unwrap();
        assert!(!is_last_day_of_month(dt));
    }

    /// Given a Sunday, returns the next day (Monday).
    #[test]
    fn next_monday_from_sunday_returns_next_day() {
        let sunday = NaiveDate::from_ymd_opt(2026, 1, 18).unwrap();
        let result = next_monday(sunday);
        assert_eq!(result, NaiveDate::from_ymd_opt(2026, 1, 19).unwrap());
    }

    /// Given a Monday, returns the following Monday (+7 days).
    #[test]
    fn next_monday_from_monday_returns_following_week() {
        let monday = NaiveDate::from_ymd_opt(2026, 1, 19).unwrap();
        let result = next_monday(monday);
        assert_eq!(result, NaiveDate::from_ymd_opt(2026, 1, 26).unwrap());
    }

    /// Given a Saturday, returns the Monday after next.
    #[test]
    fn next_monday_from_saturday_returns_two_days_later() {
        let saturday = NaiveDate::from_ymd_opt(2026, 1, 24).unwrap();
        let result = next_monday(saturday);
        assert_eq!(result, NaiveDate::from_ymd_opt(2026, 1, 26).unwrap());
    }

    /// January → February.
    #[test]
    fn first_of_next_month_january_to_february() {
        let date = NaiveDate::from_ymd_opt(2026, 1, 15).unwrap();
        assert_eq!(
            first_of_next_month(date),
            NaiveDate::from_ymd_opt(2026, 2, 1).unwrap()
        );
    }

    /// December → January of the next year.
    #[test]
    fn first_of_next_month_december_rollover() {
        let date = NaiveDate::from_ymd_opt(2026, 12, 31).unwrap();
        assert_eq!(
            first_of_next_month(date),
            NaiveDate::from_ymd_opt(2027, 1, 1).unwrap()
        );
    }

    /// From the first of a month → first of the following month.
    #[test]
    fn first_of_next_month_from_first_day() {
        let date = NaiveDate::from_ymd_opt(2026, 3, 1).unwrap();
        assert_eq!(
            first_of_next_month(date),
            NaiveDate::from_ymd_opt(2026, 4, 1).unwrap()
        );
    }

    /// Returns true at exactly 08:30:00.
    #[test]
    fn time_in_window_true_at_status_scheduled_time() {
        let t = NaiveTime::from_hms_opt(8, 30, 0).unwrap();
        assert!(time_in_window(t, MORNING_STATUS_SCHEDULED_TIME));
    }

    /// Returns true at 08:34:59 (inside the 5-minute window).
    #[test]
    fn time_in_window_true_in_status_window() {
        let t = NaiveTime::from_hms_opt(8, 34, 59).unwrap();
        assert!(time_in_window(t, MORNING_STATUS_SCHEDULED_TIME));
    }

    /// Returns false at 08:35:00 (exactly at the window boundary).
    #[test]
    fn time_in_window_false_at_status_boundary() {
        let t = NaiveTime::from_hms_opt(8, 35, 0).unwrap();
        assert!(!time_in_window(t, MORNING_STATUS_SCHEDULED_TIME));
    }

    /// Returns false at 08:36:00 (outside the window).
    #[test]
    fn time_in_window_false_outside_status_window() {
        let t = NaiveTime::from_hms_opt(8, 36, 0).unwrap();
        assert!(!time_in_window(t, MORNING_STATUS_SCHEDULED_TIME));
    }

    /// Returns false at 08:29:59 (one second before the window opens).
    #[test]
    fn time_in_window_false_before_status_window() {
        let t = NaiveTime::from_hms_opt(8, 29, 59).unwrap();
        assert!(!time_in_window(t, MORNING_STATUS_SCHEDULED_TIME));
    }

    /// Returns true at 15:30:00 and false at 15:36:00 for the afternoon window.
    #[test]
    fn time_in_window_afternoon_status_window() {
        let at_afternoon = NaiveTime::from_hms_opt(15, 30, 0).unwrap();
        assert!(time_in_window(at_afternoon, AFTERNOON_STATUS_SCHEDULED_TIME));

        let afternoon_boundary = NaiveTime::from_hms_opt(15, 34, 59).unwrap();
        assert!(time_in_window(
            afternoon_boundary,
            AFTERNOON_STATUS_SCHEDULED_TIME
        ));

        let afternoon_out = NaiveTime::from_hms_opt(15, 35, 0).unwrap();
        assert!(!time_in_window(afternoon_out, AFTERNOON_STATUS_SCHEDULED_TIME));

        let past_window = NaiveTime::from_hms_opt(15, 36, 0).unwrap();
        assert!(!time_in_window(
            past_window,
            AFTERNOON_STATUS_SCHEDULED_TIME
        ));
    }

    /// Build an empty in-memory [`DatabaseConnection`] with schema synced.
    async fn in_memory_db() -> DatabaseConnection {
        use sea_orm::Database;
        let db = Database::connect("sqlite::memory:").await.unwrap();
        infra::sync_database_schema(&db).await.unwrap();
        db
    }

    /// Resetting an existing weekly budget succeeds and appends a BudgetReset
    /// event.
    #[tokio::test]
    async fn run_budget_reset_job_succeeds_for_existing_weekly_budget() {
        let db = in_memory_db().await;

        // Create a weekly budget first.
        let create_cmd =
            Command::create_budget("2026-01-15", BudgetType::Weekly, 500.0, 50.0).unwrap();
        let all_events = infra::get_all_events(&db).await.unwrap();
        let create_event = CoreAggregate::new(&all_events).execute(create_cmd).unwrap();
        infra::append_event_to_db(&db, create_event).await.unwrap();

        // Reset with a new start date.
        run_budget_reset_job(&db, BudgetType::Weekly, "2026-02-01")
            .await
            .unwrap();

        // Verify the BudgetReset event was appended.
        let events = infra::get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 2);
        assert!(matches!(events[1], domain::events::Event::BudgetReset(_)));
    }

    /// Resetting a budget type that does not exist is rejected by the
    /// aggregate and returns an error.
    #[tokio::test]
    async fn run_budget_reset_job_rejects_missing_budget() {
        let db = in_memory_db().await;
        let result = run_budget_reset_job(&db, BudgetType::Monthly, "2026-01-01").await;
        assert!(result.is_err());
    }

    /// When the budget's start_date equals the reset's new_start, the reset is
    /// skipped. This prevents a Sunday-evening job from resetting a budget that
    /// starts on the following Monday (the same Monday computed by
    /// `next_monday` from Sunday), which would double the budget amount.
    #[tokio::test]
    async fn run_budget_reset_job_skips_when_start_date_equals_new_start() {
        let db = in_memory_db().await;

        // Create a weekly budget starting on Monday 2026-01-19.
        let create_cmd =
            Command::create_budget("2026-01-19", BudgetType::Weekly, 500.0, 50.0).unwrap();
        let all_events = infra::get_all_events(&db).await.unwrap();
        let create_event = CoreAggregate::new(&all_events).execute(create_cmd).unwrap();
        infra::append_event_to_db(&db, create_event).await.unwrap();

        // Reset with the same Monday — should be skipped.
        run_budget_reset_job(&db, BudgetType::Weekly, "2026-01-19")
            .await
            .unwrap();

        // Only the BudgetCreated event remains; no BudgetReset appended.
        let events = infra::get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 1);
        assert!(matches!(events[0], domain::events::Event::BudgetCreated(_)));
    }

    /// Resetting after transactions have been recorded rolls the remaining
    /// amount into the new period via the BudgetProcessManager.
    #[tokio::test]
    async fn run_budget_reset_job_rolls_over_remaining() {
        use domain::events::{
            Event,
            budgets::TrackedExpenseData,
            transactions::TransactionData,
        };
        use gateway::schema::enable_banking_api::{
            AmountType,
            transaction::{
                PartyIdentification,
                Transaction,
            },
        };

        let db = in_memory_db().await;

        // Create a weekly budget of 500.
        let create_cmd =
            Command::create_budget("2026-01-15", BudgetType::Weekly, 500.0, 500.0).unwrap();
        let all_events = infra::get_all_events(&db).await.unwrap();
        let create_event = CoreAggregate::new(&all_events).execute(create_cmd).unwrap();
        infra::append_event_to_db(&db, create_event).await.unwrap();

        // Record a 300 transaction, leaving 200 remaining.
        let transaction = Transaction {
            transaction_amount: AmountType {
                currency: "EUR".to_string(),
                amount: "300.00".to_string(),
            },
            creditor: Some(PartyIdentification {
                name: Some("Test Store".to_string()),
            }),
            debtor: None,
            booking_date: Some("2026-01-20".to_string()),
            transaction_date: Some("2026-01-20".to_string()),
            entry_reference: None,
        };
        let recorded = TransactionData::new(transaction, "test-aspsp").expect("valid transaction");
        let tracked = TrackedExpenseData::from_transaction(&recorded, BudgetType::Weekly)
            .expect("fixture transaction has a creditor");
        infra::append_event_to_db(&db, Event::BudgetExpenseTracked(tracked))
            .await
            .unwrap();

        // Run the reset job — should compute previous_remaining=200.
        run_budget_reset_job(&db, BudgetType::Weekly, "2026-02-01")
            .await
            .unwrap();

        // Verify the BudgetReset event carries the rolled-over remaining amount.
        let events = infra::get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 3); // BudgetCreated, BudgetExpenseTracked, BudgetReset
        match &events[2] {
            Event::BudgetReset(data) => {
                assert!((data.previous_remaining - 200.0).abs() < f64::EPSILON);
            },
            other => panic!("expected BudgetReset, got {other:?}"),
        }
    }

    /// Budget reset rollover uses tracked-expense events as the source of deductions.
    #[tokio::test]
    async fn run_budget_reset_job_rolls_over_tracked_expense_remaining() {
        use domain::events::{
            Event,
            budgets::TrackedExpenseData,
        };

        let db = in_memory_db().await;
        let create_cmd =
            Command::create_budget("2026-01-15", BudgetType::Weekly, 500.0, 500.0).unwrap();
        let create_event = CoreAggregate::new(&[]).execute(create_cmd).unwrap();
        infra::append_event_to_db(&db, create_event).await.unwrap();

        infra::append_event_to_db(
            &db,
            Event::BudgetExpenseTracked(TrackedExpenseData {
                transaction_id: uuid::Uuid::new_v4(),
                booking_date: Some(NaiveDate::from_ymd_opt(2026, 1, 20).unwrap()),
                transaction_date: Some(NaiveDate::from_ymd_opt(2026, 1, 20).unwrap()),
                amount: 300.0,
                currency: "EUR".to_string(),
                creditor_name: "Test Store".to_string(),
                budget_type: BudgetType::Weekly,
            }),
        )
        .await
        .unwrap();

        run_budget_reset_job(&db, BudgetType::Weekly, "2026-02-01")
            .await
            .unwrap();

        let events = infra::get_all_events(&db).await.unwrap();
        assert_eq!(events.len(), 3);
        match &events[2] {
            Event::BudgetReset(data) => assert_eq!(data.previous_remaining, 200.0),
            other => panic!("expected BudgetReset, got {other:?}"),
        }
    }

    /// The bank-balance section has a heading and one line per balance.
    #[test]
    fn format_bank_balance_section_lists_each_balance() {
        use gateway::schema::enable_banking_api::{
            AmountType,
            balance::BalanceResource,
        };

        let balances = vec![
            (
                "My Main Account".to_string(),
                BalanceResource {
                    name: "Provider Main".to_string(),
                    balance_amount: AmountType {
                        currency: "EUR".to_string(),
                        amount: "123.45".to_string(),
                    },
                },
            ),
            (
                "My Savings Account".to_string(),
                BalanceResource {
                    name: "Provider Savings".to_string(),
                    balance_amount: AmountType {
                        currency: "USD".to_string(),
                        amount: "67.89".to_string(),
                    },
                },
            ),
        ];

        let section = format_bank_balance_section(&balances);

        assert_eq!(
            section,
            "💰 <b>Bank Balance</b>\nMy Main Account: 123.45 EUR\nMy Savings Account: 67.89 USD"
        );
    }

    /// An empty balance list still includes the heading.
    #[test]
    fn format_bank_balance_section_empty_balances_keeps_heading() {
        let section = format_bank_balance_section(&[]);
        assert_eq!(section, "💰 <b>Bank Balance</b>");
    }

    /// External bank values containing HTML special characters are escaped so
    /// they render literally in a `parse_mode: "HTML"` Telegram message.
    #[test]
    fn format_bank_balance_section_escapes_html_special_characters() {
        use gateway::schema::enable_banking_api::{
            AmountType,
            balance::BalanceResource,
        };

        let balances = vec![(
            "A&B <Savings>".to_string(),
            BalanceResource {
                name: "Provider A&B <Savings>".to_string(),
                balance_amount: AmountType {
                    currency: "EUR".to_string(),
                    amount: "1<2".to_string(),
                },
            },
        )];

        let section = format_bank_balance_section(&balances);

        assert_eq!(
            section,
            "💰 <b>Bank Balance</b>\nA&amp;B &lt;Savings&gt;: 1&lt;2 EUR"
        );
    }
}
