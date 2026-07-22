import { useEffect, useState } from "react";
import {
  type BudgetType,
  type CreateBudgetPayload,
  createBudget,
  deleteBudget,
  resetBudget,
  type UpdateBudgetPayload,
  updateBudget
} from "../api/endpoints/budgets";
import { findBudgetRow } from "../api/utils";
import BudgetCard from "../components/BudgetCard";
import BudgetForm, { type BudgetFormData, type BudgetFormMode } from "../components/BudgetForm";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { useBudgets } from "../hooks/useBudgets";

/**
 * Budgets page.
 *
 * Renders inline budget creation/editing forms and budget cards with
 * read-only tracked transaction lists.
 */
export default function BudgetsPage() {
  const { budgets, loading, error, refetch } = useBudgets();
  const { showToast } = useToast();

  useEffect(() => {
    if (error) showToast(`Failed to fetch budgets: ${error}`, "error");
  }, [error]);

  const [formState, setFormState] = useState<{
    mode: BudgetFormMode;
    budgetType: BudgetType;
    initialData: Partial<BudgetFormData>;
  } | null>(null);

  /** Open the create or edit form for a budget type, depending on whether a budget exists. */
  const handleEdit = (budgetType: BudgetType) => {
    const rows = budgets[budgetType];
    const budgetRow = findBudgetRow(rows);
    if (!budgetRow) {
      setFormState({
        mode: "create",
        budgetType,
        initialData: { budget_type: budgetType }
      });
    } else {
      setFormState({
        mode: "edit",
        budgetType,
        initialData: {
          budget_type: budgetType,
          start_date: budgetRow.date || "",
          amount: budgetRow.amount,
          threshold: budgetRow.threshold
        }
      });
    }
  };

  /** Submit handler for the budget form. */
  const handleFormSubmit = async (payload: CreateBudgetPayload | UpdateBudgetPayload) => {
    if (!formState) return;
    try {
      if (formState.mode === "create") {
        await createBudget(payload as CreateBudgetPayload);
        showToast("Budget created!", "success");
      } else {
        await updateBudget(formState.budgetType, payload as UpdateBudgetPayload);
        showToast("Budget updated!", "success");
      }
      setFormState(null);
      refetch();
    } catch (err) {
      showToast(`Failed to save budget: ${err}`, "error");
    }
  };

  /** Reset a budget's tracked transactions after confirmation. */
  const handleReset = async (budgetType: BudgetType) => {
    await resetBudget(budgetType)
      .then(_ => {
        showToast("Budget reset!", "success");
        refetch();
      })
      .catch(err => showToast(`Failed to reset budget: ${err}`, "error"));
  };

  /** Delete a budget after confirmation. */
  const handleDelete = async (budgetType: BudgetType) => {
    await deleteBudget(budgetType)
      .then(_ => {
        showToast("Budget deleted!", "success");
        refetch();
      })
      .catch(err => showToast(`Failed to delete budget: ${err}`, "error"));
  };

  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto">
      <PageHeader title="Budgets" enableButtons={false} />

      <div className="flex flex-col flex-1 pb-5 rounded-lg gap-5">
        {(["weekly", "monthly"] as const).map(budgetType => {
          const isCreating = formState?.mode === "create" && formState?.budgetType === budgetType;
          const isEditing = formState?.mode === "edit" && formState?.budgetType === budgetType;

          if (isCreating || isEditing) {
            return (
              <BudgetForm
                key={budgetType}
                mode={formState!.mode}
                initialData={formState!.initialData}
                onSubmit={handleFormSubmit}
                onCancel={() => setFormState(null)}
              />
            );
          }

          const rows = budgets[budgetType];

          if (loading) return null;

          return (
            <BudgetCard
              key={budgetType}
              budgetType={budgetType}
              rows={rows}
              onEdit={() => handleEdit(budgetType)}
              onReset={handleReset}
              onDelete={handleDelete}
            />
          );
        })}

        {loading && <p className="text-gray-400 text-center">Loading budgets...</p>}
      </div>
    </div>
  );
}
