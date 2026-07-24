import { describe, expect, it } from 'vitest';
import { evaluate, evaluateLines } from './calc';

describe('calc', () => {
  it('evaluates basic arithmetic with precedence', () => {
    expect(evaluate('1 + 2 * 3')).toBe(7);
    expect(evaluate('(1 + 2) * 3')).toBe(9);
    expect(evaluate('10 / 4')).toBe(2.5);
    expect(evaluate('10 % 3')).toBe(1);
  });

  it('handles unary minus with correct precedence', () => {
    expect(evaluate('-5')).toBe(-5);
    expect(evaluate('3 * -2')).toBe(-6);
    expect(evaluate('-(2 + 3)')).toBe(-5);
    expect(evaluate('2 - -2')).toBe(4);
  });

  it('handles decimals and leading plus', () => {
    expect(evaluate('0.1 + 0.2')).toBeCloseTo(0.3);
    expect(evaluate('+7')).toBe(7);
  });

  it('throws on malformed input', () => {
    expect(() => evaluate('1 +')).toThrow();
    expect(() => evaluate('(1 + 2')).toThrow();
    expect(() => evaluate('1 2')).toThrow();
    expect(() => evaluate('abc')).toThrow();
  });

  it('evaluates lines independently and flags errors', () => {
    const lines = evaluateLines('2 + 2\n\n10 / 0\nbad');
    expect(lines[0]).toEqual({ input: '2 + 2', result: 4, error: false });
    expect(lines[1]).toEqual({ input: '', result: null, error: false });
    expect(lines[2]!.error).toBe(true); // Infinity
    expect(lines[3]!.error).toBe(true);
  });
});
