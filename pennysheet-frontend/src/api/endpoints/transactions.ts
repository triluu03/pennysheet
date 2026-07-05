import client from "../client";
import { formatDate } from "../utils";

export interface Transactions {
  id: number;
  transaction_id: string;
  booking_date: string | null;
  amount: number;
  currency: string;
  debtor_name?: string | null;
  creditor_name?: string | null;
  category: string | null;
  classification: string | null;
  note: string | null;
}

export interface TransactionsAggregated {
  date: string;
  amount: number;
}

export interface TransactionsPivot {
  date: string;
  // Categories
  Groceries: number;
  Health: number;
  Transport: number;
  Services: number;
  Leisure: number;
  Others: number;
  Uncategorized: number;
  // Classification
  "must-have": number;
  "nice-to-have": number;
  wasted: number;
  unclassified: number;
}
export const TRANSACTION_PIVOT_COLORS: Record<string, string> = {
  // Categories
  Groceries: "#34a853", // green
  Health: "#f9ab00", // yellow
  Transport: "#4285f4", // blue
  Services: "#ea4335", // red
  Leisure: "#00897b", // teal
  Others: "#9334e6", // purple
  Uncategorized: "#9ca3af", // gray

  // Classification
  "must-have": "#4285f4", // blue
  "nice-to-have": "#f9ab00", // yellow
  wasted: "#ea4335", // red
  unclassified: "#9ca3af" // gray
} as const;

export type TransactionKind = "income" | "expenses";

export type TimeAggregation = "daily" | "weekly" | "monthly";

export const TRANSACTION_CATEGORIES = [
  "Groceries",
  "Health",
  "Transport",
  "Services",
  "Leisure",
  "Others",
  "Investments",
  "Excluded"
] as const;
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const TRANSACTION_CLASSIFICATIONS = [
  "must-have",
  "nice-to-have",
  "wasted",
  "excluded"
] as const;
export type TransactionClassification = (typeof TRANSACTION_CLASSIFICATIONS)[number];

/**
 * Get transactions.
 *
 * @param startDate {Date} - (Optional) Start booking date.
 * @param endDate {Date} - (Optional) End booking date.
 * @param kind {TransactionKind} - (Optional) Transactions kind.
 * @returns {Promise<Transactions[]>} - Array of transactions.
 */
export async function getTransactions(
  startDate?: Date,
  endDate?: Date,
  kind?: TransactionKind,
  categories?: TransactionCategory[],
  classifications?: TransactionClassification[]
): Promise<Transactions[]> {
  return await client
    .get("/transactions", {
      params: {
        start_date: startDate ? formatDate(startDate) : undefined,
        end_date: endDate ? formatDate(endDate) : undefined,
        kind,
        categories: categories ? categories : TRANSACTION_CATEGORIES,
        classifications: classifications ? classifications : TRANSACTION_CLASSIFICATIONS
      }
    })
    .then(response => response.data);
}

/**
 * Get transactions time aggregated.
 *
 * @param startDate {Date} - (Optional) Start booking date.
 * @param endDate {Date} - (Optional) End booking date.
 * @param kind {TransactionKind} - (Optional) Transactions kind.
 * @param timeAggregation {TimeAggregation} - (Optional) Time aggregation level.
 * @returns {Promise<TransactionsAggregated[]>} - Array of transactions.
 */
export async function getTransactionsTimeAggregated(
  startDate?: Date,
  endDate?: Date,
  kind?: TransactionKind,
  timeAggregation?: TimeAggregation
): Promise<TransactionsAggregated[]> {
  return await client
    .get(`/transactions/aggregate/${timeAggregation}`, {
      params: {
        start_date: startDate ? formatDate(startDate) : undefined,
        end_date: endDate ? formatDate(endDate) : undefined,
        kind
      }
    })
    .then(response => response.data);
}

/**
 * Get transactions pivot table.
 *
 * @param startDate {Date} - (Optional) Start booking date.
 * @param endDate {Date} - (Optional) End booking date.
 * @returns {Promise<TransactionsPivot[]>} - Array of transactions.
 */
export async function getTransactionsPivotTable(
  startDate?: Date,
  endDate?: Date,
  categories?: TransactionCategory[],
  classifications?: TransactionClassification[]
): Promise<TransactionsPivot[]> {
  return await client
    .get(`/transactions/pivot`, {
      params: {
        start_date: startDate ? formatDate(startDate) : undefined,
        end_date: endDate ? formatDate(endDate) : undefined,
        kind: "expenses",
        categories: categories ? categories : TRANSACTION_CATEGORIES,
        classifications: classifications ? classifications : TRANSACTION_CLASSIFICATIONS
      }
    })
    .then(response => response.data);
}

/**
 * Get transactions by ID.
 *
 * @param transactionId {string} - Transaction ID, expected to be a valid UUID.
 * @returns {Promise<Transactions[]>} - Array of transactions matching the ID.
 */
export async function getTransactionsById(transactionId: string): Promise<Transactions[]> {
  return await client.get(`/transactions/${transactionId}`).then(response => response.data);
}

/**
 * Send an import transaction command.
 *
 * @param startDate {string} - (Optional) The start date of the transactions import.
 * @param endDate {string} - (Optional) The end date of the transactions import.
 * @returns {Promise<number>} - The status code of the response.
 */
export async function requestImportTransactions(
  startDate?: string,
  endDate?: string
): Promise<number> {
  return await client
    .post("/transactions/import", { start_date: startDate, end_date: endDate })
    .then(response => response.status);
}

/**
 * Send a command to categorize a transaction.
 *
 * @param transactionId {string - The transaction ID. Expected to be an existing valid UUID.
 * @param category {TransactionCategory} - The category of the transactions.
 */
export async function categorizeTransaction(
  transactionId: string,
  category: TransactionCategory
): Promise<number> {
  return await client
    .post("/transactions/category", { transaction_id: transactionId, category })
    .then(response => response.status);
}

/**
 * Send a command to classify a transaction.
 *
 * @param transactionId {string - The transaction ID. Expected to be an existing valid UUID.
 * @param classification {TransactionClassification} - The category of the transactions.
 */
export async function classifyTransaction(
  transactionId: string,
  classification: TransactionClassification
): Promise<number> {
  return await client
    .post("/transactions/classification", { transaction_id: transactionId, classification })
    .then(response => response.status);
}

/**
 * Send a command to update the note of a transaction.
 *
 * @param transactionId {string - The transaction ID. Expected to be an existing valid UUID.
 * @param note {string} - The new note of the transactions.
 */
export async function updateTransactionNote(transactionId: string, note: string): Promise<number> {
  return await client
    .post("/transactions/note", { transaction_id: transactionId, note })
    .then(response => response.status);
}
