import { useEffect, useState } from "react";

const STORAGE_PREFIX = "retail-transfer:";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Reconcile a persisted value against the expected default shape so that
 * stale data from an older version can't crash the app on reload. Arrays
 * must stay arrays, objects are merged over the defaults (filling any keys
 * the persisted value is missing), and primitives must match type.
 */
function reconcile(stored, fallback) {
  if (Array.isArray(fallback)) {
    return Array.isArray(stored) ? stored : fallback;
  }
  if (isPlainObject(fallback)) {
    return isPlainObject(stored) ? { ...fallback, ...stored } : fallback;
  }
  return typeof stored === typeof fallback ? stored : fallback;
}

function readStored(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw === null ? fallback : reconcile(JSON.parse(raw), fallback);
  } catch {
    // Corrupt or unavailable storage — fall back to the default value.
    return fallback;
  }
}

/**
 * useState backed by localStorage. Reads the persisted value on first render
 * and writes back whenever the value changes. Falls back gracefully when
 * storage is unavailable (private mode, SSR, quota errors).
 */
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => readStored(key, initialValue));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      // Ignore write failures (e.g. quota exceeded) — state still works in memory.
    }
  }, [key, value]);

  return [value, setValue];
}
