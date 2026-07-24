/**
 * Organic "blob" SVG path generation. A seeded RNG makes output deterministic
 * (and testable); points are placed around a circle with jittered radii and
 * joined into a smooth closed curve via Catmull-Rom → cubic Bézier. Pure.
 */

/** Small, fast seeded PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BlobOptions {
  seed?: number;
  points?: number;
  size?: number;
  /** 0 (perfect circle) … 1 (very lumpy). */
  randomness?: number;
}

interface Pt {
  x: number;
  y: number;
}

const fmt = (n: number) => Math.round(n * 100) / 100;

/** Generate an SVG path `d` string for a blob. */
export function blobPath(options: BlobOptions = {}): string {
  const seed = options.seed ?? 1;
  const count = Math.max(3, Math.floor(options.points ?? 6));
  const size = options.size ?? 200;
  const randomness = Math.max(0, Math.min(1, options.randomness ?? 0.35));

  const rng = mulberry32(seed);
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size * 0.42;

  const pts: Pt[] = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const r = baseR * (1 - randomness / 2 + rng() * randomness);
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  const at = (i: number) => pts[((i % count) + count) % count]!;

  let d = `M ${fmt(at(0).x)} ${fmt(at(0).y)}`;
  for (let i = 0; i < count; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${fmt(c1.x)} ${fmt(c1.y)}, ${fmt(c2.x)} ${fmt(c2.y)}, ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return `${d} Z`;
}

/** A complete standalone SVG document string for the blob. */
export function blobSvg(fill: string, options: BlobOptions = {}): string {
  const size = options.size ?? 200;
  const path = blobPath(options);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="${fill}" d="${path}"/></svg>`;
}
