import { zipSync, type Zippable } from 'fflate';

/**
 * Client-side ZIP packaging for batch downloads.
 *
 * Entries are stored (compression level 0), not deflated: the payloads are
 * already-compressed JPEGs, so re-compressing wastes CPU for no size gain.
 */

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

/**
 * Ensure every name in the list is unique, preserving order. Duplicates get a
 * ` (2)`, ` (3)`, … suffix inserted before the extension, so a ZIP never
 * contains two entries with the same path.
 *
 * ["a.jpg", "a.jpg", "a.jpg"] -> ["a.jpg", "a (2).jpg", "a (3).jpg"]
 */
export function dedupeFilenames(names: string[]): string[] {
  const seen = new Set<string>();
  return names.map((name) => {
    if (!seen.has(name)) {
      seen.add(name);
      return name;
    }
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let counter = 2;
    let candidate = `${base} (${counter})${ext}`;
    while (seen.has(candidate)) {
      counter += 1;
      candidate = `${base} (${counter})${ext}`;
    }
    seen.add(candidate);
    return candidate;
  });
}

/**
 * Build a ZIP (as bytes) from the given entries. Names are de-duplicated first.
 * Synchronous: at level 0 this is effectively a fast concatenation, so it stays
 * responsive for the handful of images a batch holds.
 */
export function buildZip(entries: ZipEntry[]): Uint8Array {
  const names = dedupeFilenames(entries.map((entry) => entry.name));
  const zippable: Zippable = {};
  names.forEach((name, index) => {
    const entry = entries[index];
    if (entry) {
      zippable[name] = [entry.data, { level: 0 }];
    }
  });
  return zipSync(zippable);
}
