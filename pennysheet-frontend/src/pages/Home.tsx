import { useAppContext } from "../App";
import BarPlot from "../components/BarPlot";
import PageHeader from "../components/PageHeader";
import { useTransactionsPivot } from "../hooks/useTransactions";

/**
 * Homepage.
 */
export default function Home() {
  const { startDate, endDate } = useAppContext();
  const { data } = useTransactionsPivot(startDate, endDate);

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
