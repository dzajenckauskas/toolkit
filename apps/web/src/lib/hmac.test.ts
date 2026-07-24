import { describe, expect, it } from 'vitest';
import { hmac } from './hmac';

describe('hmac', () => {
  it('matches the well-known HMAC-SHA256 vector', async () => {
    expect(await hmac('The quick brown fox jumps over the lazy dog', 'key', 'SHA-256')).toBe(
      'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
    );
  });

  it('produces the right digest length per algorithm', async () => {
    expect((await hmac('m', 'k', 'SHA-1')).length).toBe(40);
    expect((await hmac('m', 'k', 'SHA-512')).length).toBe(128);
  });
});
