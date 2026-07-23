import { DEFAULT_QUALITY_LEVEL, toQualityLevel, type QualityLevel } from './quality';

/**
 * Persisted, privacy-safe user preferences for the optimizer.
 *
 * Only a small setting (the chosen quality level) is stored, in localStorage —
 * no accounts, no server, and never any image content. Every access is
 * defensive: private mode, disabled storage, or quota errors must never break
 * the tool, so failures fall back to the default and are swallowed.
 */

const QUALITY_KEY = 'toolkit:optimizer:quality';

/**
 * Return a usable localStorage, or null if it is unavailable. Some browsers
 * expose `localStorage` but throw on access (Safari private mode, disabled
 * storage), so we probe with a real write.
 */
function safeStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const probe = '__toolkit_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

/** Load the saved quality level, falling back to the default when absent/invalid. */
export function loadQualityLevel(): QualityLevel {
  const storage = safeStorage();
  if (!storage) return DEFAULT_QUALITY_LEVEL;
  try {
    // toQualityLevel narrows anything unexpected (null, stale value) to the default.
    return toQualityLevel(storage.getItem(QUALITY_KEY));
  } catch {
    return DEFAULT_QUALITY_LEVEL;
  }
}

/** Persist the chosen quality level. No-ops silently if storage is unavailable. */
export function saveQualityLevel(level: QualityLevel): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(QUALITY_KEY, level);
  } catch {
    // Ignore write failures (quota, private mode) — persistence is best-effort.
  }
}
