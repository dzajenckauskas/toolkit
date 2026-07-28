import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PASSWORD_OPTIONS,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  generatePassword,
  passwordPool,
  type PasswordOptions,
} from './password';

const only = (set: Partial<PasswordOptions>): PasswordOptions => ({
  length: 32,
  lowercase: false,
  uppercase: false,
  digits: false,
  symbols: false,
  ...set,
});

describe('password', () => {
  it('generates a password of the requested length', () => {
    expect(generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 20 })).toHaveLength(20);
  });

  it('clamps length to the allowed range', () => {
    expect(generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 1 })).toHaveLength(
      MIN_PASSWORD_LENGTH,
    );
    expect(generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 9999 })).toHaveLength(
      MAX_PASSWORD_LENGTH,
    );
  });

  it('only draws from the enabled character sets', () => {
    expect(generatePassword(only({ digits: true }))).toMatch(/^[0-9]+$/);
    expect(generatePassword(only({ lowercase: true }))).toMatch(/^[a-z]+$/);
  });

  it('returns an empty string when no set is enabled', () => {
    expect(generatePassword(only({}))).toBe('');
    expect(passwordPool(only({}))).toBe('');
  });

  it('produces different passwords on successive calls', () => {
    const a = generatePassword(DEFAULT_PASSWORD_OPTIONS);
    const b = generatePassword(DEFAULT_PASSWORD_OPTIONS);
    expect(a).not.toBe(b);
  });
});
