import { useCallback, useEffect, useRef, useState } from "react";

export interface TableColumn<K extends string> {
  key: K;
  label: string;
  editCellOnSave?: (rowId: string, value: string) => Promise<number>;
}

export interface EditableColumn<K extends string> {
  key: K;
  options?: (string | null)[];
}

interface RowData {
  [prop: string]: number | string | null | undefined;
}

interface TableProps<K extends string> {
  data: RowData[];
  rowIdColumn: string;
  tableColumns: TableColumn<K>[];
  editableColumns: EditableColumn<K>[];
}

interface EditableCellProps<K extends string> {
  rowId: string;
  field: K;
  value: string | null;
  options?: (string | null)[];
  onSave?: (rowId: string, value: string) => Promise<number>;
}

/**
 * React component for an editable cell.
 */
function EditableCell<K extends string>({
  rowId,
  field,
  value,
  options,
  onSave
}: EditableCellProps<K>) {
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

  if (options) {
    return (
      <td key={field} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={editValue}
          onChange={e => {
            setEditValue(e.target.value);
            if (e.target.value !== value) onSave?.(rowId, e.target.value);
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
  } else {
    return (
      <td key={field} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={cancel}
          onKeyDown={e => {
            if (e.key === "Enter") {
              if (editValue !== value && editValue !== "") {
                onSave?.(rowId, editValue);
              }
              e.currentTarget.blur();
              setEditing(false);
            }
            if (e.key === "Escape") cancel();
          }}
        />
      </td>
    );
  }
}

/**
 * Table view.
 */
export default function Table<K extends string>({
  data,
  rowIdColumn,
  tableColumns,
  editableColumns
}: TableProps<K>) {
  const editableColumnKeys = editableColumns.map(col => col.key);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {tableColumns.map(col => (
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
            <tr key={row[rowIdColumn]} className="hover:bg-gray-50 transition-colors">
              {tableColumns.map(col =>
                editableColumnKeys.includes(col.key) ? (
                  <EditableCell
                    rowId={row[rowIdColumn] as string}
                    key={col.key}
                    field={col.key}
                    value={row[col.key]?.toString() || null}
                    options={editableColumns.find(editCol => editCol.key === col.key)?.options}
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
