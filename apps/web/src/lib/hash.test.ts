import { describe, expect, it } from 'vitest';
import { HASH_ALGORITHMS, hashText } from './hash';

describe('hash', () => {
  it('matches known SHA-256 of "abc"', async () => {
    expect(await hashText('abc', 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('matches known SHA-1 of "abc"', async () => {
    expect(await hashText('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  it('produces the right digest length for each algorithm', async () => {
    const lengths: Record<string, number> = {
      'SHA-1': 40,
      'SHA-256': 64,
      'SHA-384': 96,
      'SHA-512': 128,
    };
    for (const algo of HASH_ALGORITHMS) {
      expect((await hashText('hello', algo)).length).toBe(lengths[algo]);
    }
  });

  it('hashes the empty string', async () => {
    expect(await hashText('', 'SHA-256')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });
});
