import { useEffect } from "react";
import { useAppContext } from "../App";
import BarPlot from "../components/BarPlot";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { useTransactionsPivot } from "../hooks/useTransactions";

/**
 * Homepage.
 */
export default function Home() {
  const { startDate, endDate } = useAppContext();
  const { showToast } = useToast();

  const { data, error } = useTransactionsPivot(startDate, endDate);
  useEffect(() => {
    if (error) showToast(`Failed to fetch transactions: ${error}`, "error");
  }, [error]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Transactions Overview" />
      <div className="flex flex-col flex-1 rounded-lg gap-5">
        <BarPlot data={data} groupBy="category" />
        <BarPlot data={data} groupBy="classification" />
      </div>
    </div>
  );
}
