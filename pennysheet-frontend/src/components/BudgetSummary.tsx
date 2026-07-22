import { type BudgetsResponse } from "../api/endpoints/budgets";
import { computeRemaining, findBudgetRow } from "../api/utils";

/**
 * Props for the budget summary widget.
 */
export interface BudgetSummaryProps {
  /** Weekly and monthly budget rows from the backend. */
  budgets: BudgetsResponse;
}

/**
 * Compact summary of remaining budget for weekly and monthly budgets.
 *
 * @param props {BudgetSummaryProps} - Budget data to summarize.
 */
export default function BudgetSummary({ budgets }: BudgetSummaryProps) {
  if (!budgets.weekly.length && !budgets.monthly.length) return null;

  return (
    <div className="flex gap-4">
      {(["weekly", "monthly"] as const).map(budgetType => {
        const rows = budgets[budgetType];
        const budgetRow = findBudgetRow(rows);
        if (!budgetRow) return null;
        const remaining = computeRemaining(rows);
        return (
          <div
            key={budgetType}
            className="flex-1 rounded-xl border border-gray-200 bg-white p-5"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {budgetType} Budget
            </h3>
            <div
              className={`text-2xl font-medium ${
                remaining !== null && remaining < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              €{remaining?.toFixed(2) ?? "—"}
              <span className="text-sm text-gray-400 font-normal"> remaining</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              of €{budgetRow.amount.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
