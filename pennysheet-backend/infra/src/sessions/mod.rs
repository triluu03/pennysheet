//! Sessions stored in the database.

use gateway::schema::enable_banking_session::EnableBankingSession;
use sea_orm::{
    ActiveValue::Set,
    DeriveEntityModel,
    FromQueryResult,
    QuerySelect,
    entity::prelude::*,
};
use serde::Serialize;
use tracing::{
    info,
    instrument,
};

#[sea_orm::model]
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "sessions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub session_id: i64,
    pub session_name: String,
    pub enable_banking_session: EnableBankingSession,
    #[sea_orm(default_expr = "Expr::current_timestamp()")]
    pub created_at: DateTime,
}

impl ActiveModelBehavior for ActiveModel {}

/// Sessions medata.
#[derive(Debug, Clone, Serialize)]
pub struct SessionMetadata {
    pub session_id: i64,
    pub session_name: String,
    pub created_at: DateTime,
}

/// Get the metadata of all stored Enable Banking sessions, both valid and expired ones.
///
/// # Errors
///
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_all_sessions_metadata(
    db: &DatabaseConnection,
) -> Result<(Vec<SessionMetadata>, Vec<SessionMetadata>), DbErr> {
    let all_sessions: Vec<Model> = Entity::find().all(db).await?;

    let (expired_sessions, valid_sessions): (Vec<Model>, Vec<Model>) = all_sessions
        .into_iter()
        .partition(|model| model.enable_banking_session.is_expired());

    let model_to_result_closure = |session: Model| SessionMetadata {
        session_id: session.session_id,
        session_name: session.session_name,
        created_at: session.created_at,
    };
    Ok((
        valid_sessions
            .into_iter()
            .map(model_to_result_closure)
            .collect(),
        expired_sessions
            .into_iter()
            .map(model_to_result_closure)
            .collect(),
    ))
}

/// Sessions data.
#[derive(Debug, Clone, Serialize, FromQueryResult)]
pub struct SessionData {
    pub session_id: i64,
    pub enable_banking_session: EnableBankingSession,
}

/// Get all Enable Banking sessions, both valid and expired ones.
///
/// # Errors
///
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_all_sessions(
    db: &DatabaseConnection,
) -> Result<(Vec<SessionData>, Vec<SessionData>), DbErr> {
    let all_sessions: Vec<SessionData> = Entity::find()
        .select_only()
        .column(Column::SessionId)
        .column(Column::EnableBankingSession)
        .order_by_id_desc()
        .into_model()
        .all(db)
        .await?;

    let (expired_sessions, valid_sessions): (Vec<SessionData>, Vec<SessionData>) = all_sessions
        .into_iter()
        .partition(|session_data| session_data.enable_banking_session.is_expired());

    Ok((valid_sessions, expired_sessions))
}

/// Get one Enable Banking session based on ID.
///
/// # Errors
///
/// Returns [`DbErr`] if the query operation fails.
#[instrument(skip(db))]
pub async fn get_session_by_id(
    db: &DatabaseConnection,
    session_id: i64,
) -> Result<SessionData, DbErr> {
    let session_data: SessionData = Entity::find_by_id(session_id)
        .select_only()
        .column(Column::SessionId)
        .column(Column::EnableBankingSession)
        .order_by_id_desc()
        .into_model()
        .one(db)
        .await?
        .ok_or(DbErr::RecordNotFound(format!(
            "Session ID {session_id} is not found!"
        )))?;

    if session_data.enable_banking_session.is_expired() {
        Err(DbErr::Custom(format!(
            "Session ID {session_id} has expired!"
        )))
    } else {
        Ok(session_data)
    }
}

/// Insert new session to the table.
///
/// # Errors
///
/// Returns [`DbErr`] if the insertion fails.
#[instrument(skip(db))]
pub async fn create_new_session(
    db: &DatabaseConnection,
    name: String,
    session: EnableBankingSession,
) -> Result<SessionMetadata, DbErr> {
    let new_session = ActiveModel {
        session_name: Set(name),
        enable_banking_session: Set(session),
        ..Default::default()
    };

    let result: Model = new_session.insert(db).await?;
    info!(session_id = result.session_id, "created new session");

    Ok(SessionMetadata {
        session_id: result.session_id,
        session_name: result.session_name,
        created_at: result.created_at,
    })
}

/// Delete a session from the table.
///
/// # Errors
///
/// Returns [`DbErr`] if the insertion fails.
#[instrument(skip(db))]
pub async fn delete_session(db: &DatabaseConnection, session_id: i64) -> Result<(), DbErr> {
    match Entity::find_by_id(session_id).one(db).await? {
        Some(session) => {
            session.delete(db).await?;
            Ok(())
        },
        None => Err(DbErr::RecordNotFound(format!(
            "Session ID: {session_id} is not found!"
        ))),
    }
}
