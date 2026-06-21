import { useState } from "react";
import type { TransactionKind } from "../api/endpoints/transactions";
import Table from "../components/Table";
import { useTransactions } from "../hooks/useTransactions";

/**
 * Details page.
 */
export default function DetailsPage() {
  const [startDate, setStartDate] = useState<string>("2026-05-01");
  const [endDate, setEndDate] = useState<string>("2026-06-20");
  const [kind, setKind] = useState<TransactionKind | undefined>("expenses");

  const { data, loading, error } = useTransactions(startDate, endDate, kind);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between pb-6">
        <div className="flex flex-col">
          <div>Personal Expenses</div>
          <h1 className="text-2xl font-medium">Transactions Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-gray-300 bg-stone-300">
            <button className="p-2">Last month</button>
            <button className="p-2">Last 2 months</button>
            <button className="p-2">Last 3 months</button>
          </div>
          <button className="px-4 py-2 rounded-lg bg-stone-300">Fetch Transactions</button>
        </div>
      </div>
      <div className="flex flex-col flex-1 rounded-lg gap-5">
        <Table data={data} />
      </div>
    </div>
  );
}
