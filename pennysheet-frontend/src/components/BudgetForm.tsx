import { useState } from "react";
import type {
  BudgetType,
  CreateBudgetPayload,
  UpdateBudgetPayload
} from "../api/endpoints/budgets";

/**
 * Form mode for creating or editing a budget.
 */
export type BudgetFormMode = "create" | "edit";

/**
 * Complete form data shape used by the budget form.
 */
export interface BudgetFormData {
  budget_type: BudgetType;
  start_date: string;
  amount: number;
  threshold: number;
}

/**
 * Props for the budget form component.
 */
export interface BudgetFormProps {
  /** Whether the form is creating a new budget or editing an existing one. */
  mode: BudgetFormMode;
  /** Initial values for the form fields. */
  initialData?: Partial<BudgetFormData>;
  /** Called when the form is submitted. */
  onSubmit: (payload: CreateBudgetPayload | UpdateBudgetPayload) => Promise<void>;
  /** Called when the user cancels the form. */
  onCancel: () => void;
}

/**
 * Form for creating or editing a budget.
 *
 * @param props {BudgetFormProps} - Form configuration and callbacks.
 */
export default function BudgetForm({
  mode,
  initialData,
  onSubmit,
  onCancel
}: BudgetFormProps) {
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [budgetType, setBudgetType] = useState<BudgetType>(
    initialData?.budget_type || "weekly"
  );
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [threshold, setThreshold] = useState(
    initialData?.threshold?.toString() || ""
  );
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    startDate !== "" &&
    !isNaN(parseFloat(amount)) &&
    parseFloat(amount) > 0 &&
    !isNaN(parseFloat(threshold)) &&
    parseFloat(threshold) > 0;

  const handleSubmitClick = async () => {
    setSubmitting(true);
    try {
      const basePayload = {
        start_date: startDate,
        amount: parseFloat(amount),
        threshold: parseFloat(threshold)
      };
      if (mode === "create") {
        await onSubmit({ ...basePayload, budget_type: budgetType });
      } else {
        await onSubmit(basePayload);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "create" ? "Create Budget" : `Edit ${budgetType} Budget`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-500">
          Budget Type
          <select
            value={budgetType}
            onChange={e => setBudgetType(e.target.value as BudgetType)}
            disabled={mode === "edit"}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-100"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-500">
          Start Date
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-500">
          Amount (€)
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="500.00"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-500">
          Threshold (€)
          <input
            type="number"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            placeholder="50.00"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </label>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-gray-300 text-sm hover:bg-gray-400"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600 disabled:opacity-50"
          onClick={handleSubmitClick}
          disabled={!isValid || submitting}
        >
          {mode === "create" ? "Create" : "Update"}
        </button>
      </div>
    </div>
  );
}
