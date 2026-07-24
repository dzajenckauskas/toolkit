import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64, tryDecodeBase64 } from './base64';

describe('base64', () => {
  it('round-trips ASCII text', () => {
    const text = 'Hello, world!';
    expect(decodeBase64(encodeBase64(text))).toBe(text);
  });

  it('round-trips multi-byte UTF-8 text', () => {
    const text = 'héllo — 世界 🌍';
    const encoded = encodeBase64(text);
    expect(encoded).not.toContain('—'); // it's ASCII base64 now
    expect(decodeBase64(encoded)).toBe(text);
  });

  it('matches a known encoding', () => {
    expect(encodeBase64('foobar')).toBe('Zm9vYmFy');
    expect(decodeBase64('Zm9vYmFy')).toBe('foobar');
  });

  it('tolerates surrounding whitespace when decoding', () => {
    expect(decodeBase64('  Zm9vYmFy  ')).toBe('foobar');
  });

  it('returns null for invalid Base64 via the safe decoder', () => {
    expect(tryDecodeBase64('not valid base64 !!!')).toBeNull();
    expect(tryDecodeBase64('Zm9vYmFy')).toBe('foobar');
  });
});
