import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import api from "../lib/apiClient";

interface ApiOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

export function useApi<T>(endpoint: string, options: ApiOptions = {}) {
  const { refreshInterval, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!enabled);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await api.get<T>(endpoint, { signal: controller.signal });
      setData(response.data);
      setError(null);
    } catch (err) {
      if (axios.isCancel(err)) {
        return;
      }
      const message = err instanceof Error ? err.message : "요청 중 알 수 없는 오류";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    fetchData();
    if (!refreshInterval || !enabled) {
      return;
    }
    const id = window.setInterval(fetchData, refreshInterval);
    return () => window.clearInterval(id);
  }, [fetchData, refreshInterval, enabled]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { data, loading, error, refetch: fetchData };
}
