import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CLASSIFICATIONS,
  type TransactionCategory,
  type TransactionClassification
} from "../api/endpoints/transactions";
import { formatDate } from "../api/utils";

export interface FilterState {
  startDate: Date;
  endDate: Date;
  categories: TransactionCategory[];
  classifications: TransactionClassification[];
}

interface FilterSideBarProps {
  filter: FilterState;
  onChange: (filter: FilterState) => void;
}

/**
 * Checkbox group.
 */
function CheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onChange
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (selected: T[]) => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</h3>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            className="text-indigo-500 hover:text-indigo-700"
            onClick={() => onChange([...options])}
          >
            Select All
          </button>
          <button
            type="button"
            className="text-indigo-500 hover:text-indigo-700"
            onClick={() => onChange([])}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="accent-indigo-500"
              checked={selected.includes(opt)}
              onChange={() => {
                onChange(
                  selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]
                );
              }}
            />
            {opt}
          </label>
        ))}
      </div>
    </section>
  );
}

/**
 * Filter side bar.
 */
export default function FilterSideBar({ filter, onChange }: FilterSideBarProps) {
  return (
    <aside className="flex flex-col h-screen bg-white border-r border-gray-200 w-70 p-5 gap-6 overflow-y-auto">
      {/* Date Range */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Date Range
        </h3>
        <div className="flex flex-col gap-2 mb-3">
          <button
            type="button"
            className="p-2 rounded-xl bg-stone-300 hover:bg-gray-400"
            onClick={() => {
              const now = new Date();
              const last3Months = new Date(now);
              last3Months.setMonth(now.getMonth() - 3);
              last3Months.setDate(1);

              onChange({ ...filter, startDate: last3Months, endDate: now });
            }}
          >
            Last 3 months
          </button>
          <button
            type="button"
            className="p-2 rounded-xl bg-stone-300 hover:bg-gray-400"
            onClick={() => {
              const now = new Date();
              const last6Months = new Date(now);
              last6Months.setMonth(now.getMonth() - 6);
              last6Months.setDate(1);

              onChange({ ...filter, startDate: last6Months, endDate: now });
            }}
          >
            Last 6 months
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm text-gray-500">
            Start date
            <input
              type="date"
              value={formatDate(filter.startDate)}
              onChange={e => onChange({ ...filter, startDate: new Date(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-500">
            End date
            <input
              type="date"
              value={formatDate(filter.endDate)}
              onChange={e => onChange({ ...filter, endDate: new Date(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
        </div>
      </section>

      {/* Category */}
      <CheckboxGroup
        label="Category"
        options={TRANSACTION_CATEGORIES}
        selected={filter.categories}
        onChange={categories => onChange({ ...filter, categories })}
      />

      {/* Classification */}
      <CheckboxGroup
        label="Classification"
        options={TRANSACTION_CLASSIFICATIONS}
        selected={filter.classifications}
        onChange={classifications => onChange({ ...filter, classifications })}
      />
    </aside>
  );
}
