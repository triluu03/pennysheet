import { useEffect, useState } from "react";
import { getAllSessions, type SessionsResponse } from "../api/endpoints/sessions";

export function useSessions() {
  const [data, setData] = useState<SessionsResponse>({ valid_sessions: [], expired_sessions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getAllSessions()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
