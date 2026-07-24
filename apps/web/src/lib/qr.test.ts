import { describe, expect, it } from 'vitest';
import { qrToDataUrl } from './qr';

describe('qr', () => {
  it('produces a PNG data URL', async () => {
    const url = await qrToDataUrl('https://example.com');
    expect(url.startsWith('data:image/png;base64,')).toBe(true);
    expect(url.length).toBeGreaterThan(100);
  });

  it('honors the error-correction level (changes output)', async () => {
    const low = await qrToDataUrl('hello', { errorCorrectionLevel: 'L' });
    const high = await qrToDataUrl('hello', { errorCorrectionLevel: 'H' });
    expect(low).not.toBe(high);
  });

  it('rejects empty text', async () => {
    await expect(qrToDataUrl('')).rejects.toBeTruthy();
  });
});
