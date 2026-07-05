import { useEffect, useState } from "react";
import {
  getTransactions,
  getTransactionsPivotTable,
  getTransactionsTimeAggregated,
  type TimeAggregation,
  type TransactionCategory,
  type TransactionClassification,
  type TransactionKind,
  type Transactions,
  type TransactionsAggregated,
  type TransactionsPivot
} from "../api/endpoints/transactions";

export function useTransactions(startDate: Date, endDate: Date, kind?: TransactionKind) {
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
  startDate: Date,
  endDate: Date,
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

export function useTransactionsPivot(
  startDate: Date,
  endDate: Date,
  categories: TransactionCategory[],
  classifications: TransactionClassification[]
) {
  const [data, setData] = useState<TransactionsPivot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTransactionsPivotTable(startDate, endDate, categories, classifications)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [startDate, endDate, categories, classifications]);

  return { data, loading, error };
}
