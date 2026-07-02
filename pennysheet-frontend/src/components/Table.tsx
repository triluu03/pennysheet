import { useCallback, useEffect, useRef, useState } from "react";
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

interface TableProps {
  data: Transactions[];
}

/**
 * Columns to be rendered in the table.
 */
const TABLE_COLUMNS: {
  key: keyof Transactions;
  label: string;
  editCellOnSave?: (transactionId: string, value: string) => Promise<number>;
}[] = [
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
 * Columns to support edit feature.
 */
const EDITABLE_COLUMNS: (keyof Transactions)[] = ["category", "classification", "note"];
const CATEGORY_OPTIONS = [null, ...TRANSACTION_CATEGORIES];
const CLASSIFICATION_OPTIONS = [null, ...TRANSACTION_CLASSIFICATIONS];

interface EditableCellProps {
  transactionId: string;
  field: keyof Transactions;
  value: string | null;
  onSave?: (trasactionId: string, value: string) => Promise<number>;
}

/**
 * React component for an editable cell.
 */
function EditableCell({ transactionId, field, value, onSave }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const cancel = useCallback(() => {
    setEditValue(value ?? "");
    setEditing(false);
  }, [value]);

  if (!editing) {
    return (
      <td key={field} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
        <button
          className="px-3 py-1 rounded-lg hover:bg-gray-200"
          onClick={() => {
            setEditValue(editValue || value || "");
            setEditing(true);
          }}
        >
          {editValue || value || <span className="text-gray-300 italic">N/A</span>}
        </button>
      </td>
    );
  }

  switch (field) {
    case "category":
    case "classification":
      const options = field === "category" ? CATEGORY_OPTIONS : CLASSIFICATION_OPTIONS;
      return (
        <td key={field} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={editValue}
            onChange={e => {
              setEditValue(e.target.value);
              if (e.target.value !== value) onSave?.(transactionId, e.target.value);
              setEditing(false);
            }}
            onKeyDown={e => {
              if (e.key === "Escape") cancel();
            }}
          >
            {options.map(opt => (
              <option key={opt || ""} value={opt || ""}>
                {opt || "N/A"}
              </option>
            ))}
          </select>
        </td>
      );

    case "note":
      return (
        <td key={field} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => {
              if (editValue !== value && editValue !== "") {
                onSave?.(transactionId, editValue);
              }
              setEditing(false);
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (editValue !== value && editValue !== "") {
                  onSave?.(transactionId, editValue);
                }
                e.currentTarget.blur();
                setEditing(false);
              }
              if (e.key === "Escape") cancel();
            }}
          />
        </td>
      );

    default:
      return (
        <td key={field} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
          {value || <span className="text-gray-300 italic">N/A</span>}
        </td>
      );
  }
}

/**
 * Table view.
 */
export default function Table({ data }: TableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {TABLE_COLUMNS.map(col => (
              <th
                key={col.key}
                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map(row => (
            <tr key={row.transaction_id} className="hover:bg-gray-50 transition-colors">
              {TABLE_COLUMNS.map(col =>
                EDITABLE_COLUMNS.includes(col.key) ? (
                  <EditableCell
                    transactionId={row.transaction_id}
                    key={col.key}
                    field={col.key}
                    value={row[col.key]?.toString() || null}
                    onSave={col.editCellOnSave}
                  />
                ) : (
                  <td key={col.key} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                    {row[col.key] || <span className="text-gray-300 italic">N/A</span>}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
