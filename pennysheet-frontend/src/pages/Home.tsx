import { useEffect } from "react";
import { useAppContext } from "../App";
import BarPlot from "../components/BarPlot";
import FilterSideBar from "../components/FilterSideBar";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { useTransactionsPivot } from "../hooks/useTransactions";

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
  useEffect(() => {
    if (error) showToast(`Failed to fetch transactions: ${error}`, "error");
  }, [error]);

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
        <PageHeader title="Transactions Overview" />
        <div className="flex flex-col flex-1 rounded-lg gap-5">
          <BarPlot data={data} groupBy="category" />
          <BarPlot data={data} groupBy="classification" />
        </div>
      </div>
    </div>
  );
}
