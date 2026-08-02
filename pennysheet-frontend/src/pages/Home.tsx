import { useEffect, useState } from "react";
import { useAppContext } from "../App";
import BarPlot from "../components/BarPlot";
import BudgetSummary from "../components/BudgetSummary";
import FilterSideBar from "../components/FilterSideBar";
import PageHeader from "../components/PageHeader";
import TimeSeriesBar from "../components/TimeSeriesBar";
import { useToast } from "../components/Toast";
import { useBudgets } from "../hooks/useBudgets";
import { useTransactionsAggregated, useTransactionsPivot } from "../hooks/useTransactions";

/**
 * Homepage.
 */
export default function Home() {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    categories,
    setCategories,
    classifications,
    setClassifications
  } = useAppContext();
  const { showToast } = useToast();

  const { data, error } = useTransactionsPivot(startDate, endDate, categories, classifications);
  const { data: incomeData, error: incomeError } = useTransactionsAggregated(
    startDate,
    endDate,
    "income",
    "monthly",
    categories,
    classifications
  );
  const { budgets: budgetsData } = useBudgets();

  const [groupBy, setGroupBy] = useState<"category" | "classification">("category");

  useEffect(() => {
    if (error) showToast(`Failed to fetch transactions: ${error}`, "error");
    if (incomeError) showToast(`Failed to fetch income: ${incomeError}`, "error");
  }, [error, incomeError, showToast]);

  return (
    <div className="flex h-screen overflow-hidden">
      <FilterSideBar
        filter={{
          startDate,
          endDate,
          categories,
          classifications
        }}
        onChange={filter => {
          setCategories(filter.categories);
          setClassifications(filter.classifications);
          setStartDate(filter.startDate);
          setEndDate(filter.endDate);
        }}
      />
      <div className="flex flex-col flex-1 h-full p-8 overflow-y-auto">
        <PageHeader title="Overview" />
        <div className="flex flex-col flex-1 rounded-lg gap-5">
          <BudgetSummary budgets={budgetsData} />
          <div className="inline-flex bg-gray-300 p-2 rounded-xl gap-2">
            {[
              { key: "category" as const, label: "By Category" },
              { key: "classification" as const, label: "By Classification" }
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setGroupBy(key)}
                aria-pressed={groupBy === key}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  groupBy === key
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <BarPlot key={groupBy} data={data} groupBy={groupBy} />
          <TimeSeriesBar data={incomeData} title="Income over time" fill="#34a853" />
        </div>
      </div>
    </div>
  );
}
