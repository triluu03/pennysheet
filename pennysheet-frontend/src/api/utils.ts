import type { BudgetRow } from "./endpoints/budgets";

/**
 * Nil UUID used to identify the budget tracking row in projection tables.
 */
export const NIL_UUID = "00000000-0000-0000-0000-000000000000";

/**
 * Format datetime into date.
 */
export const formatDate = (d: Date) => d.toISOString().split("T")[0];

/**
 * Find the budget tracking row from a list of projection rows.
 *
 * The budget row is identified by a nil UUID `transaction_id`.
 *
 * @param rows {BudgetRow[]} - Projection rows for one budget type.
 * @returns {BudgetRow | undefined} - The budget row, or undefined if not found.
 */
export function findBudgetRow(rows: BudgetRow[]): BudgetRow | undefined {
  return rows.find(row => row.transaction_id === NIL_UUID);
}

/**
 * Filter transaction rows from a projection, excluding the budget row itself.
 *
 * @param rows {BudgetRow[]} - Projection rows for one budget type.
 * @returns {BudgetRow[]} - Only the tracked transaction rows.
 */
export function getTransactionRows(rows: BudgetRow[]): BudgetRow[] {
  return rows.filter(row => row.transaction_id !== NIL_UUID);
}

/**
 * Calculate the remaining budget amount.
 *
 * @param rows {BudgetRow[]} - Projection rows for one budget type.
 * @returns {number | null} - Remaining amount, or null if no budget row exists.
 */
export function computeRemaining(rows: BudgetRow[]): number | null {
  const budgetRow = findBudgetRow(rows);
  if (!budgetRow) return null;
  const transactionTotal = getTransactionRows(rows).reduce(
    (sum, row) => sum + row.amount,
    0
  );
  return budgetRow.amount + transactionTotal;
}
