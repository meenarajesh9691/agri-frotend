"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/http";

/**
 * Service function chalata hai aur data / loading / error deta hai.
 * deps badalne par dobara fetch hota hai. Purana (late aaya) jawab ignore ho jaata hai.
 *
 *   const { data, loading, error, reload } = useApi(() => shopService.list({ page }), [page]);
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef(fetcher);
  const callId = useRef(0);
  const key = JSON.stringify(deps);

  useEffect(() => {
    latest.current = fetcher;
  });

  const load = useCallback(async () => {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await latest.current();
      if (id === callId.current) setData(result);
    } catch (e) {
      if (id === callId.current) setError(getErrorMessage(e));
    } finally {
      if (id === callId.current) setLoading(false);
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load };
}

export function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
