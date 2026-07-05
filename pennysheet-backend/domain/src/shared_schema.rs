//! Shared schema within the crate.
//!
//! This contains the data used for corresponding commands and events.

use std::str::FromStr;

#[cfg(feature = "sea-orm-support")]
use sea_orm::{
    DeriveActiveEnum,
    entity::prelude::*,
};
use serde::{
    Deserialize,
    Serialize,
};
use strum::EnumIter;
use uuid::Uuid;

use crate::errors::DomainError;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, EnumIter)]
#[serde(rename_all = "PascalCase")]
#[cfg_attr(feature = "sea-orm-support", derive(DeriveActiveEnum))]
#[cfg_attr(
    feature = "sea-orm-support",
    sea_orm(
        rs_type = "String",
        db_type = "String(StringLen::None)",
        rename_all = "PascalCase"
    )
)]
pub enum TransactionCategory {
    Groceries,
    Health,
    Transport,
    Services,
    Leisure,
    Others,
    Investments,
    Excluded,
}

impl FromStr for TransactionCategory {
    type Err = DomainError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "groceries" => Ok(Self::Groceries),
            "health" => Ok(Self::Health),
            "transport" => Ok(Self::Transport),
            "services" => Ok(Self::Services),
            "leisure" => Ok(Self::Leisure),
            "others" => Ok(Self::Others),
            "investments" => Ok(Self::Investments),
            "excluded" => Ok(Self::Excluded),
            _ => Err(DomainError::Parsing(format!(
                "the value `{s}` is not expected"
            ))),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransactionCategoryData {
    pub transaction_id: Uuid,
    pub category: TransactionCategory,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, EnumIter)]
#[serde(rename_all = "kebab-case")]
#[cfg_attr(feature = "sea-orm-support", derive(DeriveActiveEnum))]
#[cfg_attr(
    feature = "sea-orm-support",
    sea_orm(
        rs_type = "String",
        db_type = "String(StringLen::None)",
        rename_all = "kebab-case"
    )
)]
pub enum TransactionClassification {
    MustHave,
    NiceToHave,
    Wasted,
    Excluded,
}

impl FromStr for TransactionClassification {
    type Err = DomainError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "must-have" => Ok(Self::MustHave),
            "nice-to-have" => Ok(Self::NiceToHave),
            "wasted" => Ok(Self::Wasted),
            "excluded" => Ok(Self::Excluded),
            _ => Err(DomainError::Parsing(format!(
                "the value `{s}` is not expected"
            ))),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransactionClassificationData {
    pub transaction_id: Uuid,
    pub classification: TransactionClassification,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransactionNoteData {
    pub transaction_id: Uuid,
    pub note: String,
}
