import { describe, expect, it } from 'vitest';
import { unzipSync } from 'fflate';
import { buildZip, dedupeFilenames } from './zip';

describe('dedupeFilenames', () => {
  it('leaves already-unique names untouched', () => {
    expect(dedupeFilenames(['a.jpg', 'b.jpg'])).toEqual(['a.jpg', 'b.jpg']);
  });

  it('suffixes duplicates before the extension, preserving order', () => {
    expect(dedupeFilenames(['a.jpg', 'a.jpg', 'a.jpg'])).toEqual([
      'a.jpg',
      'a (2).jpg',
      'a (3).jpg',
    ]);
  });

  it('handles names without an extension', () => {
    expect(dedupeFilenames(['photo', 'photo'])).toEqual(['photo', 'photo (2)']);
  });

  it('does not collide with a pre-existing suffixed name', () => {
    const result = dedupeFilenames(['a.jpg', 'a (2).jpg', 'a.jpg']);
    expect(result).toEqual(['a.jpg', 'a (2).jpg', 'a (3).jpg']);
    expect(new Set(result).size).toBe(result.length);
  });
});

describe('buildZip', () => {
  it('produces a valid ZIP whose entries round-trip', () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    const b = new Uint8Array([5, 6, 7]);
    const zipped = buildZip([
      { name: 'a.jpg', data: a },
      { name: 'b.jpg', data: b },
    ]);

    // ZIP local-file-header magic "PK\x03\x04".
    expect(Array.from(zipped.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);

    const back = unzipSync(zipped);
    expect(Object.keys(back).sort()).toEqual(['a.jpg', 'b.jpg']);
    expect(Array.from(back['a.jpg'] ?? [])).toEqual([1, 2, 3, 4]);
    expect(Array.from(back['b.jpg'] ?? [])).toEqual([5, 6, 7]);
  });

  it('de-duplicates entry names so nothing is overwritten', () => {
    const zipped = buildZip([
      { name: 'same.jpg', data: new Uint8Array([1]) },
      { name: 'same.jpg', data: new Uint8Array([2]) },
    ]);
    const back = unzipSync(zipped);
    expect(Object.keys(back).sort()).toEqual(['same (2).jpg', 'same.jpg']);
  });
});
