import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../App";
import {
  categorizeTransaction,
  classifyTransaction,
  TRANSACTION_CATEGORIES,
  TRANSACTION_CLASSIFICATIONS,
  TRANSACTION_PIVOT_COLORS,
  type TransactionCategory,
  type TransactionClassification,
  type TransactionKind,
  type Transactions,
  updateTransactionNote
} from "../api/endpoints/transactions";
import FilterSideBar from "../components/FilterSideBar";
import PageHeader from "../components/PageHeader";
import Table, { type EditableColumn, type TableColumn } from "../components/Table";
import { useToast } from "../components/Toast";
import { useTransactions } from "../hooks/useTransactions";

/**
 * Returns table column definitions for the given transaction kind.
 * Swaps the second column between creditor (expenses) and debtor (income).
 */
function buildTableColumns(kind: TransactionKind): TableColumn<keyof Transactions>[] {
  return [
    { key: "booking_date", label: "Date" },
    kind === "expenses"
      ? { key: "creditor_name", label: "Creditor" }
      : { key: "debtor_name", label: "Debtor" },
    { key: "amount", label: "Amount" },
    { key: "currency", label: "Currency" },
    {
      key: "category",
      label: "Category",
      editCellOnSave: async (transactionId: string, value: string) =>
        categorizeTransaction(transactionId, value as TransactionCategory),
      colorMap: TRANSACTION_PIVOT_COLORS
    },
    {
      key: "classification",
      label: "Classification",
      editCellOnSave: async (transactionId: string, value: string) =>
        classifyTransaction(transactionId, value as TransactionClassification),
      colorMap: TRANSACTION_PIVOT_COLORS
    },
    {
      key: "note",
      label: "Note",
      editCellOnSave: async (transactionId: string, value: string) =>
        updateTransactionNote(transactionId, value)
    }
  ];
}

/**
 * Columns to support edit feature
 */
const EDITABLE_COLUMNS: EditableColumn<keyof Transactions>[] = [
  {
    key: "category",
    options: [null, ...TRANSACTION_CATEGORIES]
  },
  {
    key: "classification",
    options: [null, ...TRANSACTION_CLASSIFICATIONS]
  },
  {
    key: "note"
  }
];

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

  const [kind, setKind] = useState<TransactionKind>("expenses");

  const tableColumns = useMemo(() => buildTableColumns(kind), [kind]);

  const { data, error } = useTransactions(startDate, endDate, kind, categories, classifications);
  useEffect(() => {
    if (error) showToast(`Failed to fetch transactions: ${error}`, "error");
  }, [error, showToast]);

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
        <PageHeader title="Transaction Details" />
        <div className="flex gap-2 mb-4">
          {(["expenses", "income"] as TransactionKind[]).map(k => (
            <button
              key={k}
              type="button"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                kind === k
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
              onClick={() => setKind(k)}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-col flex-1 rounded-lg gap-5">
          <Table
            data={data}
            rowIdColumn="transaction_id"
            tableColumns={tableColumns}
            editableColumns={EDITABLE_COLUMNS}
          />
        </div>
      </div>
    </div>
  );
}
