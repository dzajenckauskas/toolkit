/**
 * Base64 encode/decode that is UTF-8 safe (handles multi-byte characters,
 * which raw btoa/atob mangle). Works in the browser and in jsdom/Node.
 */

export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Decode Base64 to text. Throws on invalid input. */
export function decodeBase64(base64: string): string {
  const binary = atob(base64.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Decode without throwing: returns null when the input is not valid Base64. */
export function tryDecodeBase64(base64: string): string | null {
  try {
    return decodeBase64(base64);
  } catch {
    return null;
  }
}
