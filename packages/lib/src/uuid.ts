/**
 * UUID (v4) generation. Uses the platform crypto, so it's cryptographically
 * random and works in the browser and in jsdom/Node.
 */

export const MAX_UUIDS = 100;

export function generateUuid(): string {
  return crypto.randomUUID();
}

/** Generate `count` v4 UUIDs. Count is clamped to 1..MAX_UUIDS. */
export function generateUuids(count: number): string[] {
  const n = Math.min(Math.max(Math.floor(count) || 1, 1), MAX_UUIDS);
  return Array.from({ length: n }, generateUuid);
}

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidV4(value: string): boolean {
  return V4.test(value);
}
