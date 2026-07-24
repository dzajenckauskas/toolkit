import { describe, expect, it } from 'vitest';
import { buildPdf, type PdfImage } from './images-to-pdf';

const fakeJpeg = (n: number): PdfImage => ({
  jpeg: new Uint8Array([0xff, 0xd8, 0xff, ...Array(n).fill(0), 0xff, 0xd9]),
  width: 100,
  height: 80,
});

const text = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes);

describe('images-to-pdf', () => {
  it('produces a valid-looking PDF envelope', () => {
    const pdf = buildPdf([fakeJpeg(10)]);
    const s = text(pdf);
    expect(s.startsWith('%PDF-1.')).toBe(true);
    expect(s.includes('/DCTDecode')).toBe(true);
    expect(s.includes('startxref')).toBe(true);
    expect(s.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('creates one page per image with the right count', () => {
    const pdf = buildPdf([fakeJpeg(5), fakeJpeg(5), fakeJpeg(5)]);
    const s = text(pdf);
    expect(s).toContain('/Count 3');
    expect((s.match(/\/Type \/Page[^s]/g) ?? []).length).toBe(3);
  });

  it('embeds the JPEG bytes and their length', () => {
    const img = fakeJpeg(4);
    const s = text(buildPdf([img]));
    expect(s).toContain(`/Length ${img.jpeg.length}`);
  });

  it('throws with no images', () => {
    expect(() => buildPdf([])).toThrow();
  });
});
