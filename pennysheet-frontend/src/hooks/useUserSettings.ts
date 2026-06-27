import { useEffect, useState } from "react";
import { getUserSettings, type UserSettings } from "../api/endpoints/userSettings";

export function useUserSettings() {
  const [data, setData] = useState<UserSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserSettings()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
