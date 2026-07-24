/**
 * HMAC generation via Web Crypto. Reuses the SHA algorithm names from `hash`.
 * Works in the browser and in Node's webcrypto.
 */

import { type HashAlgorithm } from './hash';
import { encodeToArrayBuffer } from './webcrypto';

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Compute HMAC(message, key) with the given SHA hash; returns lowercase hex. */
export async function hmac(message: string, secret: string, hash: HashAlgorithm): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encodeToArrayBuffer(secret),
    { name: 'HMAC', hash },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encodeToArrayBuffer(message));
  return toHex(signature);
}
