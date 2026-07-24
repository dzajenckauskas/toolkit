/**
 * URL encode/decode helpers around the platform encodeURIComponent /
 * decodeURIComponent. Pure; works anywhere.
 */

export function encodeUrl(text: string): string {
  return encodeURIComponent(text);
}

/** Decode a percent-encoded string. Throws on malformed input. */
export function decodeUrl(text: string): string {
  return decodeURIComponent(text.replace(/\+/g, '%20'));
}

/** Decode without throwing; returns null on malformed input. */
export function tryDecodeUrl(text: string): string | null {
  try {
    return decodeUrl(text);
  } catch {
    return null;
  }
}
