import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import type { Transactions } from "../api/endpoints/transactions";

interface TableProps {
  data: Transactions[];
  onSave?: (updated: Partial<Transactions> & { transaction_id: string }) => void;
}

const CATEGORY_OPTIONS = [
  null,
  "Groceries",
  "Health",
  "Transport",
  "Services",
  "Leisure",
  "Others"
];
const CLASSIFICATION_OPTIONS = [null, "must-have", "nice-to-have", "wasted"];

const COLUMNS: { key: keyof Transactions; label: string }[] = [
  { key: "booking_date", label: "Date" },
  { key: "creditor_name", label: "Creditor" },
  { key: "amount", label: "Amount" },
  { key: "currency", label: "Currency" },
  { key: "category", label: "Category" },
  { key: "classification", label: "Classification" },
  { key: "note", label: "Note" }
];

/**
 * Table view.
 */
export default function Table({ data, onSave }: TableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string | null>>({});

  function startEdit(row: Transactions) {
    setEditingId(row.transaction_id);
    setEditValues({
      category: row.category ?? null,
      classification: row.classification ?? null,
      note: row.note ?? ""
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({});
  }

  function saveEdit(row: Transactions) {
    onSave?.({ transaction_id: row.transaction_id, ...editValues });
    setEditingId(null);
    setEditValues({});
  }

  function renderCell(row: Transactions, colKey: keyof Transactions) {
    const isEditing = editingId === row.transaction_id;

    if (!isEditing) {
      return row[colKey];
    }

    switch (colKey) {
      case "category":
        return (
          <select
            className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={editValues.category ?? ""}
            onChange={e => setEditValues(v => ({ ...v, category: e.target.value || null }))}
          >
            {CATEGORY_OPTIONS.map(o => (
              <option key={o ?? ""} value={o ?? ""}>
                {o ?? "—"}
              </option>
            ))}
          </select>
        );
      case "classification":
        return (
          <select
            className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={editValues.classification ?? ""}
            onChange={e => setEditValues(v => ({ ...v, classification: e.target.value || null }))}
          >
            {CLASSIFICATION_OPTIONS.map(o => (
              <option key={o ?? ""} value={o ?? ""}>
                {o ?? "—"}
              </option>
            ))}
          </select>
        );
      case "note":
        return (
          <input
            className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={editValues.note ?? ""}
            onChange={e => setEditValues(v => ({ ...v, note: e.target.value }))}
          />
        );
      default:
        return row[colKey];
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {COLUMNS.map(col => (
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
              {COLUMNS.map(col => (
                <td key={col.key} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                  {renderCell(row, col.key)}
                </td>
              ))}
              <td className="px-3 py-3.5">
                {editingId === row.transaction_id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => saveEdit(row)}
                      className="p-2 rounded hover:bg-gray-200 text-emerald-600 transition-colors cursor-pointer"
                    >
                      <CheckIcon className="size-5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 rounded hover:bg-gray-200 text-red-400 transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="size-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(row)}
                    className="p-2 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <PencilIcon className="size-5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
