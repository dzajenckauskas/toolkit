import { DEFAULT_QUALITY_LEVEL, toQualityLevel, type QualityLevel } from './quality';
import { IMAGE_FORMATS, type ImageFormat } from './image';

/**
 * Persisted, privacy-safe user preferences for the image tools.
 *
 * Only small settings (chosen format, quality, named presets) are stored, in
 * localStorage — no accounts, no server, and never any image content. Every
 * access is defensive: private mode, disabled storage, or quota errors must
 * never break a tool, so failures fall back to the default and are swallowed.
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

// --- generic JSON-backed storage ------------------------------------------

function readJSON(storage: Storage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeJSON(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures (quota, private mode) — persistence is best-effort.
  }
}

/** Narrow an arbitrary value to a known ImageFormat, falling back to `fallback`. */
function toImageFormat(value: unknown, fallback: ImageFormat): ImageFormat {
  return typeof value === 'string' && (IMAGE_FORMATS as string[]).includes(value)
    ? (value as ImageFormat)
    : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

// --- per-tool last-used settings (Resize / Convert / Rotate) -------------

export interface ResizeSettings {
  format: ImageFormat;
  keepAspect: boolean;
}
export const DEFAULT_RESIZE_SETTINGS: ResizeSettings = { format: 'png', keepAspect: true };
const RESIZE_KEY = 'toolkit:resize:settings';

export function loadResizeSettings(): ResizeSettings {
  const storage = safeStorage();
  if (!storage) return DEFAULT_RESIZE_SETTINGS;
  const raw = asRecord(readJSON(storage, RESIZE_KEY));
  return {
    format: toImageFormat(raw.format, DEFAULT_RESIZE_SETTINGS.format),
    keepAspect:
      typeof raw.keepAspect === 'boolean' ? raw.keepAspect : DEFAULT_RESIZE_SETTINGS.keepAspect,
  };
}

export function saveResizeSettings(settings: ResizeSettings): void {
  const storage = safeStorage();
  if (storage) writeJSON(storage, RESIZE_KEY, settings);
}

export interface ConvertSettings {
  format: ImageFormat;
  quality: number;
}
export const DEFAULT_CONVERT_SETTINGS: ConvertSettings = { format: 'png', quality: 0.9 };
const CONVERT_KEY = 'toolkit:convert:settings';

export function loadConvertSettings(): ConvertSettings {
  const storage = safeStorage();
  if (!storage) return DEFAULT_CONVERT_SETTINGS;
  const raw = asRecord(readJSON(storage, CONVERT_KEY));
  const quality =
    typeof raw.quality === 'number' && raw.quality > 0 && raw.quality <= 1
      ? raw.quality
      : DEFAULT_CONVERT_SETTINGS.quality;
  return { format: toImageFormat(raw.format, DEFAULT_CONVERT_SETTINGS.format), quality };
}

export function saveConvertSettings(settings: ConvertSettings): void {
  const storage = safeStorage();
  if (storage) writeJSON(storage, CONVERT_KEY, settings);
}

export interface RotateSettings {
  format: ImageFormat;
}
export const DEFAULT_ROTATE_SETTINGS: RotateSettings = { format: 'png' };
const ROTATE_KEY = 'toolkit:rotate:settings';

export function loadRotateSettings(): RotateSettings {
  const storage = safeStorage();
  if (!storage) return DEFAULT_ROTATE_SETTINGS;
  const raw = asRecord(readJSON(storage, ROTATE_KEY));
  return { format: toImageFormat(raw.format, DEFAULT_ROTATE_SETTINGS.format) };
}

export function saveRotateSettings(settings: RotateSettings): void {
  const storage = safeStorage();
  if (storage) writeJSON(storage, ROTATE_KEY, settings);
}

// --- named presets ---------------------------------------------------------
//
// A lightweight, per-tool preset store: name a settings combination and
// reapply it later from a dropdown (e.g. "Etsy listing: WebP @ 80%").
// Presets are namespaced by tool id so each tool's settings shape stays
// independent; storage is client-only, same defensive rules as above.

export interface Preset<T> {
  name: string;
  settings: T;
}

function presetsKey(tool: string): string {
  return `toolkit:presets:${tool}`;
}

function isPreset<T>(value: unknown): value is Preset<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { name?: unknown }).name === 'string' &&
    'settings' in value
  );
}

/** List the presets saved for a tool, oldest first. Never throws. */
export function listPresets<T>(tool: string): Preset<T>[] {
  const storage = safeStorage();
  if (!storage) return [];
  const raw = readJSON(storage, presetsKey(tool));
  return Array.isArray(raw) ? raw.filter((entry): entry is Preset<T> => isPreset<T>(entry)) : [];
}

/**
 * Save (or overwrite, by name) a named preset for a tool. No-ops for a
 * blank name or when storage is unavailable.
 */
export function savePreset<T>(tool: string, name: string, settings: T): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const storage = safeStorage();
  if (!storage) return;
  const rest = listPresets<T>(tool).filter((preset) => preset.name !== trimmed);
  writeJSON(storage, presetsKey(tool), [...rest, { name: trimmed, settings }]);
}

/** Delete a named preset for a tool. No-ops if it doesn't exist. */
export function deletePreset(tool: string, name: string): void {
  const storage = safeStorage();
  if (!storage) return;
  const rest = listPresets(tool).filter((preset) => preset.name !== name);
  writeJSON(storage, presetsKey(tool), rest);
}
