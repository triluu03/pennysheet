//! Scheduled budget-reset background jobs.
//!
//! Resets active budgets on a fixed schedule:
//! - **Weekly** budget resets every Sunday evening; the new `start_date` is the following Monday.
//! - **Monthly** budget resets on the last calendar day of the month; the new `start_date` is the
//!   first day of the next month.

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
};
use infra::{
    DatabaseConnection,
    append_event_to_db,
    get_all_events,
};
use tracing::{
    error,
    info,
    instrument,
};

use crate::errors::AppError;

/// Target wall-clock time for the daily schedule check (8 PM local).
const SCHEDULED_TIME: NaiveTime =
    NaiveTime::from_hms_opt(20, 0, 0).expect("hard-coded 20:00:00 must be a valid time");

/// Width of the window (in minutes) after `SCHEDULED_TIME` during which the
/// job is eligible to fire.
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
/// - The event table cannot be loaded.
/// - The aggregate rejects the reset command (e.g. no active budget).
/// - The event cannot be appended to the store.
#[instrument(skip(db), fields(%budget_type, %start_date))]
async fn run_budget_reset_job(
    db: &DatabaseConnection,
    budget_type: BudgetType,
    start_date: &str,
) -> Result<(), AppError> {
    let command = Command::create_reset_budget(start_date, budget_type)?;

    let all_events = get_all_events(db).await?;
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
    time_in_window(now.time())
}

/// Determine whether `now` falls on the last calendar day of the month inside
/// the scheduled window.
fn is_last_day_of_month(now: chrono::DateTime<Local>) -> bool {
    let today = now.date_naive();
    let last_day = first_of_next_month(today).pred_opt().unwrap_or(today);
    if today != last_day {
        return false;
    }
    time_in_window(now.time())
}

/// Return true when `t` is within [`SCHEDULED_TIME`, `SCHEDULED_TIME` +
/// `WINDOW_MINUTES`).
fn time_in_window(t: NaiveTime) -> bool {
    let window_end = SCHEDULED_TIME + Duration::minutes(WINDOW_MINUTES);
    t >= SCHEDULED_TIME && t < window_end
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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{
        Local,
        NaiveDate,
        TimeZone,
    };

    /// Returns true for a Sunday at exactly 20:00 local time.
    #[test]
    fn is_sunday_evening_true_on_sunday_at_scheduled_time() {
        // 2026-01-18 is a Sunday.
        let dt = Local.with_ymd_and_hms(2026, 1, 18, 20, 0, 0).unwrap();
        assert!(is_sunday_evening(dt));
    }

    /// Returns false for a Sunday outside the 5-minute window.
    #[test]
    fn is_sunday_evening_false_outside_window() {
        let dt = Local.with_ymd_and_hms(2026, 1, 18, 20, 6, 0).unwrap();
        assert!(!is_sunday_evening(dt));
    }

    /// Returns false for a non-Sunday at 20:00.
    #[test]
    fn is_sunday_evening_false_on_non_sunday() {
        // 2026-01-19 is a Monday.
        let dt = Local.with_ymd_and_hms(2026, 1, 19, 20, 0, 0).unwrap();
        assert!(!is_sunday_evening(dt));
    }

    /// Returns true on the last day of a 31-day month at 20:00.
    #[test]
    fn is_last_day_of_month_true_on_31st() {
        let dt = Local.with_ymd_and_hms(2026, 1, 31, 20, 0, 0).unwrap();
        assert!(is_last_day_of_month(dt));
    }

    /// Returns true on Feb 28 of a non-leap year at 20:00.
    #[test]
    fn is_last_day_of_month_true_on_feb_28_non_leap() {
        // 2025 is not a leap year.
        let dt = Local.with_ymd_and_hms(2025, 2, 28, 20, 0, 0).unwrap();
        assert!(is_last_day_of_month(dt));
    }

    /// Returns false on a day that is not the last day of the month.
    #[test]
    fn is_last_day_of_month_false_on_non_last_day() {
        let dt = Local.with_ymd_and_hms(2026, 1, 15, 20, 0, 0).unwrap();
        assert!(!is_last_day_of_month(dt));
    }

    /// Returns false on the last day but outside the time window.
    #[test]
    fn is_last_day_of_month_false_outside_window() {
        let dt = Local.with_ymd_and_hms(2026, 1, 31, 20, 6, 0).unwrap();
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
}
