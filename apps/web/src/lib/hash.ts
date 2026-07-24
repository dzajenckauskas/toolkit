/**
 * Cryptographic hashing via the Web Crypto SubtleCrypto API. SHA family only —
 * MD5 is not offered by SubtleCrypto (and is unsuitable for security anyway).
 * Works in the browser and in Node's webcrypto.
 */

export const HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Hash a string with the given SHA algorithm; returns lowercase hex. */
export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return toHex(digest);
}

/** Hash raw bytes (e.g. a file's contents) with the given SHA algorithm. */
export async function hashBytes(bytes: ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return toHex(digest);
}

/** Case- and whitespace-insensitive comparison of two hex checksums. */
export function checksumsMatch(a: string, b: string): boolean {
  const norm = (value: string) => value.trim().toLowerCase();
  return norm(a) !== '' && norm(a) === norm(b);
}
