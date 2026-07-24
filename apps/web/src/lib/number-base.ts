/**
 * Convert non-negative integers between bases 2–36. Uses BigInt so very large
 * values stay exact (unlike parseInt/Number). Pure; works anywhere.
 */

export const COMMON_BASES = [2, 8, 10, 16] as const;

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

export function isValidBase(base: number): boolean {
  return Number.isInteger(base) && base >= 2 && base <= 36;
}

function digitValue(char: string): number {
  return DIGITS.indexOf(char.toLowerCase());
}

/** Parse a string in `base` to a BigInt. Throws on invalid digits/base. */
export function parseInBase(value: string, base: number): bigint {
  if (!isValidBase(base)) throw new Error(`Base must be between 2 and 36 (got ${base}).`);
  const trimmed = value.trim().toLowerCase();
  if (trimmed === '') throw new Error('Nothing to convert.');
  let result = 0n;
  const big = BigInt(base);
  for (const char of trimmed) {
    const d = digitValue(char);
    if (d < 0 || d >= base) throw new Error(`"${char}" is not a valid base-${base} digit.`);
    result = result * big + BigInt(d);
  }
  return result;
}

/** Format a BigInt in `base`. */
export function toBase(value: bigint, base: number): string {
  if (!isValidBase(base)) throw new Error(`Base must be between 2 and 36 (got ${base}).`);
  if (value === 0n) return '0';
  const big = BigInt(base);
  let n = value;
  let out = '';
  while (n > 0n) {
    out = DIGITS[Number(n % big)] + out;
    n /= big;
  }
  return out;
}

/** Convert `value` from `fromBase` to `toBaseN`. Throws on invalid input. */
export function convertBase(value: string, fromBase: number, toBaseN: number): string {
  return toBase(parseInBase(value, fromBase), toBaseN);
}
