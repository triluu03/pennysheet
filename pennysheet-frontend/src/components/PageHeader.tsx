import { useAppContext } from "../App";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Header for every page.
 */
export default function PageHeader({ title, subtitle = "Personal Expenses" }: PageHeaderProps) {
  const { nLastMonths, setNLastMonths } = useAppContext();

  return (
    <div className="flex justify-between pb-6">
      <div className="flex flex-col">
        <div>{subtitle}</div>
        <h1 className="text-2xl font-medium">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-xl border border-gray-300 bg-stone-300">
          <button
            className={`p-2 rounded-l-xl hover:bg-gray-400 ${nLastMonths === 1 ? "bg-indigo-400" : ""}`}
            onClick={() => setNLastMonths(1)}
          >
            Last month
          </button>
          <button
            className={`p-2 hover:bg-gray-400 ${nLastMonths === 2 ? "bg-indigo-400" : ""}`}
            onClick={() => setNLastMonths(2)}
          >
            Last 2 months
          </button>
          <button
            className={`p-2 rounded-r-xl hover:bg-gray-400 ${nLastMonths === 3 ? "bg-indigo-400" : ""}`}
            onClick={() => setNLastMonths(3)}
          >
            Last 3 months
          </button>
        </div>
        <button className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400">
          Fetch Transactions
        </button>
      </div>
    </div>
  );
}
