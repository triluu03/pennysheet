import { useEffect, useState } from "react";
import { getAllSessions, type SessionsResponse } from "../api/endpoints/sessions";

/**
 * Fetches the user's Enable Banking sessions.
 *
 * @returns The session data together with loading and error state.
 */
export function useSessions() {
  const [data, setData] = useState<SessionsResponse>({ valid_sessions: [], expired_sessions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // NOTE: `useSessions` is consumed by both the global expiry toast (via
    // `Layout`) and the sessions page. Each consumer fetches independently, so
    // when both are mounted at once (e.g. on `/user`) this fires duplicate
    // `getAllSessions()` requests.
    // TODO: Deduplicate these requests (e.g. via a shared cache or a
    // `SessionsProvider` context) if the duplicate fetching becomes a problem.
    getAllSessions()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
