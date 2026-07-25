/**
 * Safe localStorage helpers.
 *
 * Previously every screen called `JSON.parse(localStorage.getItem(key))` directly
 * inside a `useState` initialiser. That has two failure modes that both take the
 * whole app down with a blank screen:
 *   1. A malformed/legacy value throws a SyntaxError during render.
 *   2. `localStorage` itself throws (Safari private mode, disabled cookies,
 *      SSR/no-DOM environments, storage quota exceeded).
 */

const memoryFallback = new Map<string, string>();

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    // Touch the API so that access-denied errors surface here rather than later.
    const probe = '__nexora_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

const storage = getStorage();

export function readString(key: string): string | null {
  try {
    if (storage) return storage.getItem(key);
    return memoryFallback.get(key) ?? null;
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    if (storage) {
      storage.setItem(key, value);
      return;
    }
    memoryFallback.set(key, value);
  } catch (error) {
    // Quota exceeded or storage disabled - degrade to in-memory so the UI keeps working.
    memoryFallback.set(key, value);
    console.warn(`[storage] Unable to persist "${key}"`, error);
  }
}

export function removeKey(key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    /* ignore */
  }
  memoryFallback.delete(key);
}

/**
 * Reads and parses a JSON value, falling back to `fallback` when the key is
 * absent, unparsable, or fails the optional `validate` guard.
 */
export function readJSON<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  const raw = readString(key);
  if (raw === null) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] Corrupt JSON for "${key}", falling back to defaults`, error);
    removeKey(key);
    return fallback;
  }

  if (parsed === null || parsed === undefined) return fallback;
  if (validate && !validate(parsed)) {
    console.warn(`[storage] Unexpected shape for "${key}", falling back to defaults`);
    removeKey(key);
    return fallback;
  }

  return parsed as T;
}

export function writeJSON(key: string, value: unknown): void {
  try {
    writeString(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Unable to serialise "${key}"`, error);
  }
}

/** Type guard helper for the many array-shaped values this app persists. */
export function isArrayOf<T>(itemGuard?: (value: unknown) => boolean) {
  return (value: unknown): value is T[] =>
    Array.isArray(value) && (!itemGuard || value.every(itemGuard));
}

export const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
