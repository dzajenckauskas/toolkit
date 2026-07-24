import { describe, expect, it } from 'vitest';
import { convertBase, parseInBase, toBase } from './number-base';

describe('number-base', () => {
  it('converts between common bases', () => {
    expect(convertBase('255', 10, 16)).toBe('ff');
    expect(convertBase('ff', 16, 10)).toBe('255');
    expect(convertBase('1010', 2, 10)).toBe('10');
    expect(convertBase('777', 8, 2)).toBe('111111111');
  });

  it('stays exact for very large values', () => {
    const big = '123456789012345678901234567890';
    expect(convertBase(convertBase(big, 10, 16), 16, 10)).toBe(big);
  });

  it('handles zero', () => {
    expect(toBase(0n, 2)).toBe('0');
    expect(convertBase('0', 10, 16)).toBe('0');
  });

  it('is case-insensitive for input', () => {
    expect(parseInBase('FF', 16)).toBe(255n);
  });

  it('throws on invalid digits or bases', () => {
    expect(() => convertBase('12', 2, 10)).toThrow(); // 2 is not a binary digit
    expect(() => convertBase('zz', 16, 10)).toThrow();
    expect(() => convertBase('10', 1, 10)).toThrow();
    expect(() => parseInBase('', 10)).toThrow();
  });
});
