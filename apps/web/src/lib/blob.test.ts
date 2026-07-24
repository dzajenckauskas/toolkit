import { describe, expect, it } from 'vitest';
import { blobPath, blobSvg, mulberry32 } from './blob';

describe('blob', () => {
  it('RNG is deterministic for a seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect(a()).toBe(b());
  });

  it('produces a closed cubic path', () => {
    const d = blobPath({ seed: 1, points: 6 });
    expect(d.startsWith('M ')).toBe(true);
    expect(d.endsWith(' Z')).toBe(true);
    expect(d).toContain(' C ');
  });

  it('is deterministic for the same seed and options', () => {
    expect(blobPath({ seed: 7, points: 8 })).toBe(blobPath({ seed: 7, points: 8 }));
    expect(blobPath({ seed: 7 })).not.toBe(blobPath({ seed: 8 }));
  });

  it('wraps a standalone SVG with the fill', () => {
    const svg = blobSvg('#ff0000', { seed: 2 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('fill="#ff0000"');
    expect(svg).toContain('</svg>');
  });
});
