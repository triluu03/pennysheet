import { useEffect, useState } from "react";
import {
  getAllImportRequestsMetadata,
  type ImportRequestsMetadata
} from "../api/endpoints/importRequests";

export function useImportRequestsMetadata() {
  const [data, setData] = useState<ImportRequestsMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllImportRequestsMetadata()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
