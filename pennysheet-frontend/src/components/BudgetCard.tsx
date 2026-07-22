import { useState } from "react";
import { type BudgetRow, type BudgetType } from "../api/endpoints/budgets";
import { computeRemaining, findBudgetRow, getTransactionRows } from "../api/utils";

/**
 * Props for a single budget card.
 */
export interface BudgetCardProps {
  /** The budget type rendered by this card. */
  budgetType: BudgetType;
  /** All projection rows for this budget type, including the budget row and tracked transactions. */
  rows: BudgetRow[];
  /** Called when the user starts editing this budget. */
  onEdit: (budgetType: BudgetType) => void;
  /** Called when the user resets this budget's tracked transactions. */
  onReset: (budgetType: BudgetType) => void;
  /** Called when the user deletes this budget. */
  onDelete: (budgetType: BudgetType) => void;
}

/**
 * Card displaying one budget's summary and a read-only list of tracked transactions.
 *
 * @param props {BudgetCardProps} - Budget data and action callbacks.
 */
export default function BudgetCard({
  budgetType,
  rows,
  onEdit,
  onReset,
  onDelete
}: BudgetCardProps) {
  const [showTransactions, setShowTransactions] = useState(false);

  const budgetRow = findBudgetRow(rows);
  const transactionRows = getTransactionRows(rows);

  if (!budgetRow) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-400">
        <p className="mb-3">No {budgetType} budget configured.</p>
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600"
          onClick={() => onEdit(budgetType)}
        >
          Create {budgetType} Budget
        </button>
      </div>
    );
  }

  const remaining = computeRemaining(rows);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Budget summary header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium capitalize">{budgetType} Budget</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              onClick={() => onEdit(budgetType)}
            >
              Edit
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              onClick={() => {
                onReset(budgetType);
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                onDelete(budgetType);
              }}
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-gray-400 uppercase">Start Date</span>
            <p className="text-base font-medium">{budgetRow.date || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase">Budget</span>
            <p className="text-base font-medium">€{budgetRow.amount.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase">Threshold</span>
            <p className="text-base font-medium">€{budgetRow.threshold.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase">Remaining</span>
            <p
              className={`text-base font-medium ${
                remaining !== null && remaining < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              €{remaining?.toFixed(2) ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Tracked transactions */}
      <div className="border-t border-gray-200">
        <button
          type="button"
          className="flex items-center justify-between w-full px-6 py-3 text-sm text-gray-500 hover:bg-gray-50"
          onClick={() => setShowTransactions(!showTransactions)}
        >
          <span>Tracked Transactions ({transactionRows.length})</span>
          <span
            className={`transform transition-transform ${showTransactions ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>
        {showTransactions && (
          <div className="px-6 pb-4">
            {transactionRows.length === 0 ? (
              <p className="text-sm text-gray-400 py-3">No tracked transactions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="py-3 font-semibold">Date</th>
                    <th className="py-3 font-semibold">Creditor</th>
                    <th className="py-3 font-semibold">Amount</th>
                    <th className="py-3 font-semibold">Category</th>
                    <th className="py-3 font-semibold">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactionRows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-700">{row.date || "—"}</td>
                      <td className="py-3 text-gray-700">{row.creditor_name}</td>
                      <td className={`py-3 ${row.amount < 0 ? "text-red-600" : ""}`}>
                        €{row.amount.toFixed(2)}
                      </td>
                      <td className="py-3 text-gray-700">{row.category || "—"}</td>
                      <td className="py-3 text-gray-700">{row.classification || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
