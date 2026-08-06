import { useCallback, useEffect, useRef, useState } from "react";

import { fetchSetupStatus } from "../services/setupStatusService";
import type { SetupStatus } from "../types/app";

interface UseSetupStatusResult {
  status: SetupStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const POLL_INTERVAL_MS = 5000;

export function useSetupStatus(): UseSetupStatusResult {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const cancelledRef = useRef(false);

  const refetch = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    fetchSetupStatus()
      .then((data) => {
        if (!cancelledRef.current) {
          setStatus(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelledRef.current) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelledRef.current) {
          setLoading(false);
        }
      });

    return () => {
      cancelledRef.current = true;
    };
  }, [tick]);

  // Keep polling while setup is incomplete so the wizard advances on its own.
  useEffect(() => {
    if (!status || status.setupComplete) {
      return;
    }
    const interval = setInterval(refetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, refetch]);

  return { status, loading, error, refetch };
}
