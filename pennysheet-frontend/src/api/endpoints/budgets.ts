/**
 * Budget API endpoints.
 */

import client from "../client";

/**
 * Budget type: weekly or monthly.
 */
export const BUDGET_TYPES = ["weekly", "monthly"] as const;
export type BudgetType = (typeof BUDGET_TYPES)[number];

/**
 * A single row from a budget projection table.
 *
 * The budget row itself uses a nil UUID as `transaction_id`. Tracked
 * transactions have real UUIDs and negative amounts.
 */
export interface BudgetRow {
  id: number;
  transaction_id: string;
  date: string | null;
  amount: number;
  currency: string;
  creditor_name: string;
  threshold: number;
  category: string | null;
  classification: string | null;
  auto_category: string | null;
  auto_classification: string | null;
  created_at: string;
}

/**
 * Response from GET /budgets containing both budget types.
 */
export interface BudgetsResponse {
  weekly: BudgetRow[];
  monthly: BudgetRow[];
}

/**
 * Payload for creating a new budget.
 */
export interface CreateBudgetPayload {
  start_date: string;
  budget_type: BudgetType;
  amount: number;
  threshold: number;
}

/**
 * Payload for updating an existing budget.
 */
export interface UpdateBudgetPayload {
  start_date: string;
  amount: number;
  threshold: number;
}

/**
 * Fetch all budgets and their tracked transactions.
 *
 * @returns {Promise<BudgetsResponse>} - Weekly and monthly budget rows.
 */
export async function getBudgets(): Promise<BudgetsResponse> {
  return await client.get("/budgets").then(response => response.data);
}

/**
 * Fetch budget rows for a single budget type.
 *
 * @param budgetType {BudgetType} - The budget type to fetch.
 * @returns {Promise<BudgetRow[]>} - Array of budget and tracked transaction rows.
 */
export async function getBudget(budgetType: BudgetType): Promise<BudgetRow[]> {
  return await client.get(`/budgets/${budgetType}`).then(response => response.data);
}

/**
 * Create a new budget.
 *
 * @param payload {CreateBudgetPayload} - The budget to create.
 * @returns {Promise<number>} - The HTTP status code of the response.
 */
export async function createBudget(payload: CreateBudgetPayload): Promise<number> {
  return await client.post("/budgets", payload).then(response => response.status);
}

/**
 * Update an existing budget.
 *
 * @param budgetType {BudgetType} - The budget type to update.
 * @param payload {UpdateBudgetPayload} - The updated budget data.
 * @returns {Promise<number>} - The HTTP status code of the response.
 */
export async function updateBudget(
  budgetType: BudgetType,
  payload: UpdateBudgetPayload
): Promise<number> {
  return await client.patch(`/budgets/${budgetType}`, payload).then(response => response.status);
}

/**
 * Delete an existing budget.
 *
 * @param budgetType {BudgetType} - The budget type to delete.
 * @returns {Promise<number>} - The HTTP status code of the response.
 */
export async function deleteBudget(budgetType: BudgetType): Promise<number> {
  return await client.delete(`/budgets/${budgetType}`).then(response => response.status);
}

/**
 * Reset a budget's tracked transactions.
 *
 * @param budgetType {BudgetType} - The budget type to reset.
 * @returns {Promise<number>} - The HTTP status code of the response.
 */
export async function resetBudget(budgetType: BudgetType): Promise<number> {
  return await client.post(`/budgets/${budgetType}/reset`).then(response => response.status);
}
