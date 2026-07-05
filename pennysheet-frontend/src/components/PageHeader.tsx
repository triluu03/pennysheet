import { useRef, useState } from "react";
import { requestImportTransactions } from "../api/endpoints/transactions";
import { formatDate } from "../api/utils";
import { useToast } from "./Toast";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  enableButtons?: boolean;
}

/**
 * Header for every page.
 */
export default function PageHeader({
  title,
  subtitle = "Personal Expenses",
  enableButtons = true
}: PageHeaderProps) {
  const { showToast } = useToast();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const todayDateString = formatDate(new Date());
  const [startDate, setStartDate] = useState<string>(todayDateString);
  const [endDate, setEndDate] = useState<string>(todayDateString);

  function sendTransactionImportRequest() {
    requestImportTransactions(startDate, endDate)
      .then(_ => showToast("Successfully request transaction import", "success"))
      .catch(error => showToast(`Failed to request transaction import: ${error}`, "error"));
  }

  return (
    <div className="flex justify-between pb-6">
      <div className="flex flex-col">
        <div>{subtitle}</div>
        <h1 className="text-2xl font-medium">{title}</h1>
      </div>
      {enableButtons && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
            onClick={() => dialogRef.current?.showModal()}
          >
            Import Transactions
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="rounded-xl border-0 shadow-lg w-80 backdrop:bg-black/40 fixed inset-0 m-auto h-fit"
        onClick={e => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        onKeyDown={e => {
          if (e.key === "Escape") {
            e.preventDefault();
            dialogRef.current?.close();
          }
        }}
      >
        <div className="flex flex-col gap-6 p-6">
          <h2 className="text-lg font-medium">Request Transaction Import</h2>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-500">
              Start date
              <input
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-500">
              End date
              <input
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-gray-300 text-sm hover:bg-gray-400"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600"
              onClick={() => {
                sendTransactionImportRequest();
                dialogRef.current?.close();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
