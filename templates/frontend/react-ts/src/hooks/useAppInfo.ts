import { useEffect, useState } from "react";

import { fetchAppInfo } from "../services/appInfoService";
import type { AppInfo } from "../types/app";

interface UseAppInfoResult {
  appInfo: AppInfo | null;
  loading: boolean;
  error: string | null;
}

export function useAppInfo(): UseAppInfoResult {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAppInfo()
      .then((data) => {
        if (!cancelled) {
          setAppInfo(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
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
