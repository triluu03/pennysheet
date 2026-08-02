import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TransactionsAggregated } from "../api/endpoints/transactions";

interface TimeSeriesBarProps {
  data: TransactionsAggregated[];
  /** Title displayed inside the card. */
  title: string;
  /** Bar fill color. Defaults to a blue shade. */
  fill?: string;
}

/**
 * Simple bar chart for time-aggregated transaction data (e.g., income over time).
 * Single bar per period, no stacking.
 */
export default function TimeSeriesBar({ data, title, fill = "#4285f4" }: TimeSeriesBarProps) {
  return (
    <div className="flex flex-col gap-2 p-2 pr-5 rounded-lg bg-white">
      <h3 className="m-3 text-xl font-medium">{title}</h3>
      <ResponsiveContainer width="100%" height={400} debounce={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="5 5 1 5" />
          <XAxis dataKey="date" niceTicks="snap125" />
          <YAxis dataKey="amount" niceTicks="snap125" />
          <Tooltip />
          <Bar dataKey="amount" fill={fill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
