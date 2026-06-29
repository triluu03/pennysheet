import { useEffect, useState } from "react";
import { type EnableBankingSession, getAllSessions } from "../api/endpoints/sessions";

export function useSessions() {
  const [data, setData] = useState<EnableBankingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllSessions()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
