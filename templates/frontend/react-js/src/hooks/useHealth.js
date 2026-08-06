import { useEffect, useState } from "react";

import { fetchHealth } from "../services/healthService";

const POLL_INTERVAL_MS = 15000;

export function useHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
