import { useEffect } from "react";
import { useAppContext } from "../App";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import { useToast } from "../components/Toast";
import { useTransactions } from "../hooks/useTransactions";

/**
 * Details page.
 */
export default function DetailsPage() {
  const { startDate, endDate } = useAppContext();
  const { showToast } = useToast();

  const { data, error } = useTransactions(startDate, endDate, "expenses");
  useEffect(() => {
    if (error) showToast(`Failed to fetch transactions: ${error}`, "error");
  }, [error]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Transactions Details" />
      <div className="flex flex-col flex-1 rounded-lg gap-5">
        <Table data={data} />
      </div>
    </div>
  );
}
