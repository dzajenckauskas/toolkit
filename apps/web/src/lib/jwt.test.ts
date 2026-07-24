import { describe, expect, it } from 'vitest';
import { decodeJwt } from './jwt';

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
});
