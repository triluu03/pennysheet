import { useEffect } from "react";
import { useAppContext } from "../App";
import FilterSideBar from "../components/FilterSideBar";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import { useToast } from "../components/Toast";
import { useTransactions } from "../hooks/useTransactions";

/**
 * Details page.
 */
export default function DetailsPage() {
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

  const { data, error } = useTransactions(
    startDate,
    endDate,
    "expenses",
    categories,
    classifications
  );
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
        <PageHeader title="Transactions Details" />
        <div className="flex flex-col flex-1 rounded-lg gap-5">
          <Table data={data} />
        </div>
      </div>
    </div>
  );
}
