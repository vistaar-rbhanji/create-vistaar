import { useEffect, useState } from "react";

import { fetchHealth } from "../services/healthService";
import type { HealthInfo } from "../types/app";

interface UseHealthResult {
  health: HealthInfo | null;
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 15000;

export function useHealth(): UseHealthResult {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchHealth()
        .then((data) => {
          if (!cancelled) {
            setHealth(data);
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
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { health, loading, error };
}
