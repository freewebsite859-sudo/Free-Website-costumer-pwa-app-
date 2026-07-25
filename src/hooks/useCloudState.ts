import { useCallback, useEffect, useRef, useState } from 'react';
import { readJSON, writeJSON } from '../utils/storage';

/**
 * A piece of state that lives in localStorage when signed out and in Supabase
 * when signed in.
 *
 * The component API stays identical to `useState`, so screens do not need to
 * know where the data came from. Writes are optimistic: local state updates
 * immediately, the remote call happens in the background, and a failure rolls
 * the value back and surfaces an error.
 */
export interface CloudStateOptions<T> {
  /** localStorage key used while signed out (and as an offline cache). */
  storageKey: string;
  /** Value used when nothing is stored yet. */
  fallback: T;
  /** Runtime guard so corrupt cached JSON can be discarded. */
  validate?: (value: unknown) => value is T;
  /** Loads the value from Supabase. Omit for local-only state. */
  load?: () => Promise<T>;
  /** True when the remote source should be used. */
  enabled: boolean;
}

export interface CloudState<T> {
  value: T;
  setValue: (updater: T | ((prev: T) => T)) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCloudState<T>({
  storageKey,
  fallback,
  validate,
  load,
  enabled,
}: CloudStateOptions<T>): CloudState<T> {
  const [value, setLocalValue] = useState<T>(() =>
    readJSON<T>(storageKey, fallback, validate),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards against a slow response from a previous session overwriting newer data.
  const requestIdRef = useRef(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const refresh = useCallback(async () => {
    if (!enabled || !load) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const remote = await load();
      if (requestId !== requestIdRef.current) return; // superseded
      setLocalValue(remote);
      writeJSON(storageKey, remote); // keep an offline cache
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[cloud-state] ${storageKey}`, e);
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [enabled, load, storageKey]);

  useEffect(() => {
    if (enabled) {
      void refresh();
    } else {
      // Signed out: fall back to whatever is cached locally.
      requestIdRef.current++;
      setLocalValue(readJSON<T>(storageKey, fallback, validate));
      setError(null);
      setLoading(false);
    }
    // `fallback`/`validate` are intentionally excluded - they are static per call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, refresh, storageKey]);

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setLocalValue((prev) => {
        const next =
          typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        // Always mirror to localStorage so a refresh keeps working offline.
        writeJSON(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  return { value, setValue, loading, error, refresh };
}

/**
 * Runs a remote mutation with optimistic local state and automatic rollback.
 */
export async function withOptimisticUpdate<T>(
  apply: (updater: (prev: T) => T) => void,
  optimistic: (prev: T) => T,
  rollback: (prev: T) => T,
  mutate: () => Promise<unknown>,
  onError?: (message: string) => void,
): Promise<void> {
  apply(optimistic);
  try {
    await mutate();
  } catch (e) {
    apply(rollback);
    const message = e instanceof Error ? e.message : String(e);
    console.error('[mutation]', e);
    onError?.(message);
  }
}
