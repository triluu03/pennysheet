import { useEffect } from "react";
import { useToast } from "../components/Toast";
import { useSessions } from "./useSessions";

/**
 * Fires a warning toast when there are expired Enable Banking sessions.
 *
 * Side-effect-only hook that must be used within a ToastProvider. It keeps
 * the expiry check available on every routed page, not just the sessions UI.
 *
 * @returns {void}
 */
export function useSessionExpiryToast() {
  const { data, loading, error } = useSessions();
  const { showToast } = useToast();

  useEffect(() => {
    if (!loading && !error && data.expired_sessions.length > 0) {
      showToast(
        "You have expired Enable Banking sessions. Please address them by deleting and re-importing a new one.",
        "warning"
      );
    }
  }, [data.expired_sessions.length, loading, error, showToast]);
}
