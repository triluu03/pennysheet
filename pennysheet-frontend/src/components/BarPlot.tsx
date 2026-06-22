import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TransactionsAggregated } from "../api/endpoints/transactions";

interface BarPlotProps {
  data: TransactionsAggregated[];
  groupBy?: "category" | "classification";
}

/**
 * Bar plot for transactions.
 */
export default function BarPlot({ data, groupBy = "category" }: BarPlotProps) {
  return (
    <div className="flex flex-col gap-2 p-2 pr-5 rounded-lg bg-white">
      <h2 className="m-3 text-xl font-medium">Groupby: {groupBy}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="5 5 1 5" />
          <XAxis dataKey="date" niceTicks="snap125" />
          <YAxis dataKey="amount" niceTicks="snap125" />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" stackId="a" fill="#8884d8" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
