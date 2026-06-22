import { useEffect, useState } from "react";
import {
  getTransactions,
  getTransactionsTimeAggregated,
  type TimeAggregation,
  type TransactionKind,
  type Transactions,
  type TransactionsAggregated
} from "../api/endpoints/transactions";

export function useTransactions(startDate: string, endDate: string, kind?: TransactionKind) {
  const [data, setData] = useState<Transactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTransactions(startDate, endDate, kind)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return { data, loading, error };
}

export function useTransactionsAggregated(
  startDate: string,
  endDate: string,
  kind?: TransactionKind,
  timeAggregation?: TimeAggregation
) {
  const [data, setData] = useState<TransactionsAggregated[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTransactionsTimeAggregated(startDate, endDate, kind, timeAggregation)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return { data, loading, error };
}
