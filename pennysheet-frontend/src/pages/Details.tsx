import { useAppContext } from "../App";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import { useTransactions } from "../hooks/useTransactions";

/**
 * Details page.
 */
export default function DetailsPage() {
  const { startDate, endDate } = useAppContext();
  const { data } = useTransactions(startDate, endDate, "expenses");

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Transactions Details" />
      <div className="flex flex-col flex-1 rounded-lg gap-5">
        <Table data={data} />
      </div>
    </div>
  );
}
