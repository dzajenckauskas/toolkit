import { describe, expect, it } from 'vitest';
import { base32Decode, generateTotp, totpTimeRemaining } from './totp';

// RFC 6238 test secret: ASCII "12345678901234567890" in base32.
const RFC_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('totp', () => {
  it('decodes base32 to the expected bytes', () => {
    expect(new TextDecoder().decode(base32Decode(RFC_SECRET))).toBe('12345678901234567890');
  });

  it('matches the RFC 6238 SHA-1 vector at T=59', async () => {
    // RFC vector is 94287082 (8 digits); the 6-digit code is the last 6.
    expect(await generateTotp(RFC_SECRET, { timestamp: 59_000 })).toBe('287082');
  });

  it('matches the RFC 6238 SHA-1 vector at T=1111111109', async () => {
    // RFC vector 07081804 → 6 digits 081804.
    expect(await generateTotp(RFC_SECRET, { timestamp: 1_111_111_109_000 })).toBe('081804');
  });

  it('reports time remaining in the window', () => {
    expect(totpTimeRemaining(30, 0)).toBe(30);
    expect(totpTimeRemaining(30, 10_000)).toBe(20);
  });

  it('rejects invalid base32', () => {
    expect(() => base32Decode('0189!')).toThrow();
  });
});
