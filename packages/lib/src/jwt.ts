/**
 * JWT decoding (inspection only — no signature verification, which needs the
 * secret/key) and HMAC signing. Decoding is pure; signing uses Web Crypto
 * (`encodeJwt`). Both work in the browser and in jsdom/Node.
 */

import { encodeToArrayBuffer } from './webcrypto';

export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
}

/** HMAC algorithms this module can sign with (matches the header `alg`). */
export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512';

export const JWT_ALGORITHMS: JwtAlgorithm[] = ['HS256', 'HS384', 'HS512'];

const HASH_FOR: Record<JwtAlgorithm, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
};

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Base64URL-encode a UTF-8 string (for the header/payload JSON segments). */
function base64UrlEncode(text: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(text));
}

/**
 * Decode a JWT into its header and payload objects. Throws when the token is
 * malformed or a segment is not valid JSON.
 */
export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('A JWT has three dot-separated parts.');
  }
  const [header, payload, signature] = parts as [string, string, string];
  try {
    return {
      header: JSON.parse(base64UrlDecode(header)),
      payload: JSON.parse(base64UrlDecode(payload)),
      signature,
    };
  } catch {
    throw new Error('The header or payload is not valid Base64URL-encoded JSON.');
  }
}

/**
 * Build and HMAC-sign a JWT from header/payload objects. The `alg` header is
 * always forced to the algorithm actually used to sign, so a token can't claim
 * one algorithm while being signed with another; `typ` defaults to `JWT` but
 * the caller may override it (and add claims like `kid`). Round-trips with
 * `decodeJwt`. Async because HMAC signing goes through Web Crypto.
 */
export async function encodeJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  secret: string,
  alg: JwtAlgorithm = 'HS256',
): Promise<string> {
  const finalHeader: Record<string, unknown> = { alg, typ: 'JWT', ...header };
  // `alg` is authoritative — never let a supplied header downgrade/spoof it.
  finalHeader.alg = alg;

  const signingInput = `${base64UrlEncode(JSON.stringify(finalHeader))}.${base64UrlEncode(
    JSON.stringify(payload),
  )}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encodeToArrayBuffer(secret),
    { name: 'HMAC', hash: HASH_FOR[alg] },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encodeToArrayBuffer(signingInput));
  return `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;
}
