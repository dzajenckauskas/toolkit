import { describe, expect, it } from 'vitest';
import { decodeUrl, encodeUrl, tryDecodeUrl } from './url-encode';

describe('url-encode', () => {
  it('encodes reserved characters', () => {
    expect(encodeUrl('a b&c=d?')).toBe('a%20b%26c%3Dd%3F');
  });

  it('round-trips', () => {
    const text = 'https://x.com/?q=hello world & things';
    expect(decodeUrl(encodeUrl(text))).toBe(text);
  });

  it('treats + as a space when decoding', () => {
    expect(decodeUrl('a+b')).toBe('a b');
  });

  it('returns null for malformed input via the safe decoder', () => {
    expect(tryDecodeUrl('%')).toBeNull();
    expect(tryDecodeUrl('%zz')).toBeNull();
    expect(tryDecodeUrl('%20')).toBe(' ');
  });
});
