/**
 * Unix timestamp ↔ date conversion. Pure; the "relative" helper takes an
 * explicit `now` so it stays testable.
 */

export type EpochUnit = 'seconds' | 'ms';

/** Guess whether a numeric epoch is in seconds or milliseconds. */
export function detectUnit(value: number): EpochUnit {
  // Anything past ~ year 2001 in ms (1e12) is almost certainly milliseconds.
  return Math.abs(value) >= 1e12 ? 'ms' : 'seconds';
}

export interface EpochParts {
  ms: number;
  iso: string;
  utc: string;
  local: string;
}

/** Convert a numeric epoch (in the given unit) to date representations. */
export function fromEpoch(value: number, unit: EpochUnit): EpochParts {
  const ms = unit === 'seconds' ? value * 1000 : value;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) throw new Error('Not a valid timestamp.');
  return {
    ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toString(),
  };
}

/** Parse a date string to epoch seconds + ms. Throws on invalid input. */
export function toEpoch(dateString: string): { seconds: number; ms: number } {
  const ms = Date.parse(dateString.trim());
  if (Number.isNaN(ms)) throw new Error('Could not parse that date.');
  return { seconds: Math.floor(ms / 1000), ms };
}

/** Human-readable relative time between `ms` and `now`. */
export function relativeTime(ms: number, now: number): string {
  const diff = ms - now;
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [86_400_000, 'day'],
    [3_600_000, 'hour'],
    [60_000, 'minute'],
    [1000, 'second'],
  ];
  for (const [size, name] of units) {
    if (abs >= size) {
      const n = Math.round(abs / size);
      const plural = n === 1 ? name : `${name}s`;
      return diff >= 0 ? `in ${n} ${plural}` : `${n} ${plural} ago`;
    }
  }
  return 'just now';
}
