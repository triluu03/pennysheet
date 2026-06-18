//! Shared schema within the crate.
//!
//! This contains the data used for corresponding commands and events.

#[cfg(feature = "sea-orm-support")]
use sea_orm::{
    DeriveActiveEnum,
    EnumIter,
    entity::prelude::*,
};
use serde::{
    Deserialize,
    Serialize,
};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
#[cfg_attr(feature = "sea-orm-support", derive(EnumIter, DeriveActiveEnum))]
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
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransactionCategoryData {
    pub transaction_id: Uuid,
    pub category: TransactionCategory,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
#[cfg_attr(feature = "sea-orm-support", derive(EnumIter, DeriveActiveEnum))]
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
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransactionClassificationData {
    pub transaction_id: Uuid,
    pub classification: TransactionClassification,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TransactionNoteData {
    pub transaction_id: Uuid,
    pub note: String,
}
