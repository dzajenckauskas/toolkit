/**
 * Common percentage and tip/split calculations. Pure; works anywhere.
 */

/** `percent`% of `total`. */
export function percentOf(percent: number, total: number): number {
  return (percent / 100) * total;
}

/** What percent `part` is of `whole`. */
export function whatPercent(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

/** Percent change from `from` to `to` (negative = decrease). */
export function percentChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / Math.abs(from)) * 100;
}

export interface TipResult {
  tip: number;
  total: number;
  perPerson: number;
}

/** Tip and split a bill. `people` is clamped to at least 1. */
export function tip(bill: number, percent: number, people = 1): TipResult {
  const heads = Math.max(1, Math.floor(people) || 1);
  const tipAmount = percentOf(percent, bill);
  const total = bill + tipAmount;
  return { tip: tipAmount, total, perPerson: total / heads };
}
