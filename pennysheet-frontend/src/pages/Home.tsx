import { useEffect } from "react";
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
          <TimeSeriesBar data={incomeData} title="Income over time" fill="#34a853" />
          <BarPlot data={data} groupBy="category" />
          <BarPlot data={data} groupBy="classification" />
        </div>
      </div>
    </div>
  );
}
