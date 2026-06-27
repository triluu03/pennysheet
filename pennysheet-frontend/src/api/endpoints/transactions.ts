import client from "../client";

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

export type TransactionKind = "income" | "expenses";

export type TimeAggregation = "daily" | "weekly" | "monthly";

export type TransactionCategory =
  | "Groceries"
  | "Health"
  | "Transport"
  | "Services"
  | "Leisure"
  | "Others";

export type TransactionClassification = "must-have" | "nice-to-have" | "wasted";

/**
 * Get transactions.
 *
 * @param startDate {string} - (Optional) Start booking date.
 * @param endDate {string} - (Optional) End booking date.
 * @param kind {TransactionKind} - (Optional) Transactions kind.
 * @returns {Promise<Transactions[]>} - Array of transactions.
 */
export async function getTransactions(
  startDate?: string,
  endDate?: string,
  kind?: TransactionKind
): Promise<Transactions[]> {
  return await client
    .get("/transactions", { params: { start_date: startDate, end_date: endDate, kind } })
    .then(response => response.data);
}

/**
 * Get transactions time aggregated.
 *
 * @param startDate {string} - (Optional) Start booking date.
 * @param endDate {string} - (Optional) End booking date.
 * @param kind {TransactionKind} - (Optional) Transactions kind.
 * @param timeAggregation {TimeAggregation} - (Optional) Time aggregation level.
 * @returns {Promise<Transactions[]>} - Array of transactions.
 */
export async function getTransactionsTimeAggregated(
  startDate?: string,
  endDate?: string,
  kind?: TransactionKind,
  timeAggregation?: TimeAggregation
): Promise<TransactionsAggregated[]> {
  return await client
    .get(`/transactions/aggregate/${timeAggregation}`, {
      params: { start_date: startDate, end_date: endDate, kind }
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
