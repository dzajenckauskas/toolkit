import { describe, expect, it } from 'vitest';
import { decodeJwt, encodeJwt } from './jwt';

// Standard example token from jwt.io (HS256).
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('jwt', () => {
  it('decodes the header and payload', () => {
    const decoded = decodeJwt(TOKEN);
    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(decoded.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    expect(decoded.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  it('rejects tokens without three parts', () => {
    expect(() => decodeJwt('only.two')).toThrow(/three/);
  });

  it('rejects a token whose payload is not valid JSON', () => {
    expect(() => decodeJwt('aaaa.bbbb.cccc')).toThrow(/Base64URL/);
  });

  it('encodes the canonical jwt.io HS256 token (known answer)', async () => {
    const token = await encodeJwt(
      { alg: 'HS256', typ: 'JWT' },
      { sub: '1234567890', name: 'John Doe', iat: 1516239022 },
      'your-256-bit-secret',
      'HS256',
    );
    expect(token).toBe(TOKEN);
  });

  it('round-trips with decodeJwt', async () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { sub: 'abc', role: 'admin', n: 42 };
    const token = await encodeJwt(header, payload, 's3cret', 'HS256');
    const decoded = decodeJwt(token);
    expect(decoded.header).toEqual(header);
    expect(decoded.payload).toEqual(payload);
  });

  it('forces the header alg to match the signing algorithm', async () => {
    // A caller trying to claim "none" (or the wrong HS variant) is overridden.
    const token = await encodeJwt({ alg: 'none' }, { a: 1 }, 'k', 'HS512');
    expect((decodeJwt(token).header as { alg: string }).alg).toBe('HS512');
  });

  it('produces different signatures per algorithm', async () => {
    const a = await encodeJwt({}, { a: 1 }, 'k', 'HS256');
    const b = await encodeJwt({}, { a: 1 }, 'k', 'HS512');
    expect(a).not.toBe(b);
    expect((decodeJwt(b).header as { alg: string }).alg).toBe('HS512');
  });
});
