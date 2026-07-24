/**
 * Password generation using the platform CSPRNG (crypto.getRandomValues), so
 * output is cryptographically random rather than Math.random. Works in the
 * browser and in jsdom/Node.
 */

export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 128;

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
}

const SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
} as const;

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
};

/** The character pool implied by the enabled options. */
export function passwordPool(options: PasswordOptions): string {
  let pool = '';
  if (options.lowercase) pool += SETS.lowercase;
  if (options.uppercase) pool += SETS.uppercase;
  if (options.digits) pool += SETS.digits;
  if (options.symbols) pool += SETS.symbols;
  return pool;
}

function clampLength(length: number): number {
  const n = Math.floor(length) || MIN_PASSWORD_LENGTH;
  return Math.min(Math.max(n, MIN_PASSWORD_LENGTH), MAX_PASSWORD_LENGTH);
}

/**
 * Generate a password. Returns an empty string when no character set is
 * enabled (nothing to draw from). Uses rejection sampling to avoid modulo bias.
 */
export function generatePassword(options: PasswordOptions): string {
  const pool = passwordPool(options);
  if (pool.length === 0) return '';

  const length = clampLength(options.length);
  const max = Math.floor(256 / pool.length) * pool.length; // reject bytes >= max
  const out: string[] = [];
  const buffer = new Uint8Array(length * 2);

  while (out.length < length) {
    crypto.getRandomValues(buffer);
    for (let i = 0; i < buffer.length && out.length < length; i++) {
      const byte = buffer[i]!;
      if (byte < max) out.push(pool[byte % pool.length]!);
    }
  }
  return out.join('');
}
