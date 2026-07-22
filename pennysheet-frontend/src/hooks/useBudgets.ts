import { useEffect, useState } from "react";
import { type BudgetsResponse, getBudgets } from "../api/endpoints/budgets";

/**
 * Result shape returned by {@link useBudgets}.
 */
export interface UseBudgetsResult {
  budgets: BudgetsResponse;
  loading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and refresh all budgets.
 *
 * @returns {UseBudgetsResult} - The current budgets, loading state, error, and refetch function.
 */
export function useBudgets(): UseBudgetsResult {
  const [budgets, setBudgets] = useState<BudgetsResponse>({
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    getBudgets()
      .then(setBudgets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const refetch = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await getBudgets().then(setBudgets).catch(setError);
  };

  return { budgets, loading, error, refetch };
}
