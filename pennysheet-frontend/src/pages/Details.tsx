import { useEffect } from "react";
import { useAppContext } from "../App";
import {
  categorizeTransaction,
  classifyTransaction,
  TRANSACTION_CATEGORIES,
  TRANSACTION_CLASSIFICATIONS,
  type TransactionCategory,
  type TransactionClassification,
  type Transactions,
  updateTransactionNote
} from "../api/endpoints/transactions";
import FilterSideBar from "../components/FilterSideBar";
import PageHeader from "../components/PageHeader";
import Table, { type EditableColumn, type TableColumn } from "../components/Table";
import { useToast } from "../components/Toast";
import { useTransactions } from "../hooks/useTransactions";

/**
 * Columns to be rendered in the table.
 */
const TABLE_COLUMNS: TableColumn<keyof Transactions>[] = [
  { key: "booking_date", label: "Date" },
  { key: "creditor_name", label: "Creditor" },
  { key: "amount", label: "Amount" },
  { key: "currency", label: "Currency" },
  {
    key: "category",
    label: "Category",
    editCellOnSave: async (transactionId: string, value: string) =>
      categorizeTransaction(transactionId, value.toLowerCase() as TransactionCategory)
  },
  {
    key: "classification",
    label: "Classification",
    editCellOnSave: async (transactionId: string, value: string) =>
      classifyTransaction(transactionId, value as TransactionClassification)
  },
  {
    key: "note",
    label: "Note",
    editCellOnSave: async (transactionId: string, value: string) =>
      updateTransactionNote(transactionId, value)
  }
];

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
          <Table
            data={data}
            rowIdColumn="transaction_id"
            tableColumns={TABLE_COLUMNS}
            editableColumns={EDITABLE_COLUMNS}
          />
        </div>
      </div>
    </div>
  );
}
