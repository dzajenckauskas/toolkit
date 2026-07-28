/**
 * TOTP (RFC 6238) one-time codes, the same 2FA codes as Google Authenticator /
 * Authy. HMAC-SHA1 over a 30-second counter, dynamically truncated to N digits.
 * Uses Web Crypto; works in the browser and in Node's webcrypto.
 */

import { bytesToArrayBuffer } from './webcrypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Decode an RFC 4648 base32 secret (case-insensitive, padding/space tolerant). */
export function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error(`"${char}" is not a valid base32 character.`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

export const DEFAULT_PERIOD = 30;
export const DEFAULT_DIGITS = 6;

export interface TotpOptions {
  period?: number;
  digits?: number;
  timestamp?: number; // ms since epoch
}

/** Generate the current TOTP code for a base32 secret. */
export async function generateTotp(secret: string, options: TotpOptions = {}): Promise<string> {
  const period = options.period ?? DEFAULT_PERIOD;
  const digits = options.digits ?? DEFAULT_DIGITS;
  const timestamp = options.timestamp ?? Date.now();

  const keyBytes = base32Decode(secret);
  if (keyBytes.length === 0) throw new Error('Empty secret.');

  const counter = Math.floor(timestamp / 1000 / period);
  const counterBytes = new Uint8Array(8);
  // 64-bit big-endian counter (JS numbers cover the low 32 bits we need).
  new DataView(counterBytes.buffer).setUint32(4, counter, false);

  const key = await crypto.subtle.importKey(
    'raw',
    bytesToArrayBuffer(keyBytes),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const hmac = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, bytesToArrayBuffer(counterBytes)),
  );

  const offset = hmac[hmac.length - 1]! & 0x0f;
  const binary =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);

  return (binary % 10 ** digits).toString().padStart(digits, '0');
}

/** Seconds remaining in the current TOTP window. */
export function totpTimeRemaining(period = DEFAULT_PERIOD, timestamp = Date.now()): number {
  return period - (Math.floor(timestamp / 1000) % period);
}
