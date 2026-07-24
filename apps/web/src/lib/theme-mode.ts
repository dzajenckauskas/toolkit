/**
 * Light/dark theme mode: a manual override stored in localStorage and applied
 * as `data-theme` on the document root. When unset, the app follows the OS via
 * `prefers-color-scheme` (see GlobalStyles). Pure helpers + a no-flash script.
 */

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'toolkit:theme';

/** Read the stored override, or null when following the system. */
export function storedMode(): ThemeMode | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

/** The effective mode right now (stored override, else the OS preference). */
export function resolveMode(): ThemeMode {
  const stored = storedMode();
  if (stored) return stored;
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/** Apply a mode to the document and persist it. */
export function applyMode(mode: ThemeMode): void {
  try {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* storage / DOM unavailable */
  }
}

/**
 * Inline script (stringified) that sets `data-theme` before first paint, so a
 * stored dark preference doesn't flash light. Injected in the document head.
 */
export const NO_FLASH_SCRIPT = `(function(){try{var m=localStorage.getItem('${THEME_STORAGE_KEY}');if(m==='light'||m==='dark'){document.documentElement.setAttribute('data-theme',m);}}catch(e){}})();`;
