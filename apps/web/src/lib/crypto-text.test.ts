import { describe, expect, it } from 'vitest';
import { decryptText, encryptText } from './crypto-text';

describe('crypto-text', () => {
  it('round-trips a message with the right password', async () => {
    const token = await encryptText('secret message 🕵️', 'hunter2');
    expect(token).not.toContain('secret');
    expect(await decryptText(token, 'hunter2')).toBe('secret message 🕵️');
  });

  it('produces a different token each time (random salt/iv)', async () => {
    const a = await encryptText('same', 'pw');
    const b = await encryptText('same', 'pw');
    expect(a).not.toBe(b);
  });

  it('fails to decrypt with the wrong password', async () => {
    const token = await encryptText('classified', 'correct');
    await expect(decryptText(token, 'wrong')).rejects.toThrow(/Wrong password/);
  });

  it('rejects garbage input', async () => {
    await expect(decryptText('not-a-token', 'pw')).rejects.toThrow();
  });
});
