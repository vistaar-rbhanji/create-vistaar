import { useEffect, useState } from "react";

import { fetchAppInfo } from "../services/appInfoService";

export function useAppInfo() {
  const [appInfo, setAppInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchAppInfo()
      .then((data) => {
        if (!cancelled) {
          setAppInfo(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { appInfo, loading, error };
}
