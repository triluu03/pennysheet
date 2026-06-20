import { useEffect, useState } from "react";
import {
  getTransactions,
  type TransactionKind,
  type Transactions
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
