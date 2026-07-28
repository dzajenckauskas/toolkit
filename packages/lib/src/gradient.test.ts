import { describe, expect, it } from 'vitest';
import { gradientCss } from './gradient';

describe('gradient', () => {
  const stops = [
    { color: '#ff0000', position: 0 },
    { color: '#0000ff', position: 100 },
  ];

  it('builds a linear gradient', () => {
    expect(gradientCss('linear', 90, stops)).toBe(
      'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)',
    );
  });

  it('builds a radial gradient', () => {
    expect(gradientCss('radial', 0, stops)).toBe(
      'radial-gradient(circle, #ff0000 0%, #0000ff 100%)',
    );
  });

  it('sorts stops by position', () => {
    const unsorted = [
      { color: '#111', position: 80 },
      { color: '#222', position: 10 },
    ];
    expect(gradientCss('linear', 45, unsorted)).toBe('linear-gradient(45deg, #222 10%, #111 80%)');
  });
});
