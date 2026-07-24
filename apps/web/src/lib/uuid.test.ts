import { describe, expect, it } from 'vitest';
import { MAX_UUIDS, generateUuids, isUuidV4 } from './uuid';

describe('uuid', () => {
  it('generates the requested count of valid, unique v4 UUIDs', () => {
    const ids = generateUuids(10);
    expect(ids).toHaveLength(10);
    expect(ids.every(isUuidV4)).toBe(true);
    expect(new Set(ids).size).toBe(10);
  });

  it('clamps the count to at least 1', () => {
    expect(generateUuids(0)).toHaveLength(1);
    expect(generateUuids(-5)).toHaveLength(1);
    expect(generateUuids(Number.NaN)).toHaveLength(1);
  });

  it('clamps the count to the maximum', () => {
    expect(generateUuids(9999)).toHaveLength(MAX_UUIDS);
  });

  it('validates v4 shape', () => {
    expect(isUuidV4('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
    expect(isUuidV4('not-a-uuid')).toBe(false);
    expect(isUuidV4('123e4567-e89b-12d3-a456-426614174000')).toBe(false); // version nibble not 4
  });
});
