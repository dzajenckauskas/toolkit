/**
 * Nearest CSS named colour for a hex value (Euclidean distance in RGB). Pure;
 * reuses the hex parser from `color`.
 */

import { parseHex, type Rgb } from './color';

/** The CSS named colours (the standard extended keyword set). */
export const CSS_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  lime: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  silver: '#c0c0c0',
  gray: '#808080',
  maroon: '#800000',
  olive: '#808000',
  green: '#008000',
  purple: '#800080',
  teal: '#008080',
  navy: '#000080',
  orange: '#ffa500',
  gold: '#ffd700',
  pink: '#ffc0cb',
  hotpink: '#ff69b4',
  deeppink: '#ff1493',
  crimson: '#dc143c',
  tomato: '#ff6347',
  coral: '#ff7f50',
  salmon: '#fa8072',
  orangered: '#ff4500',
  darkorange: '#ff8c00',
  khaki: '#f0e68c',
  indigo: '#4b0082',
  violet: '#ee82ee',
  orchid: '#da70d6',
  plum: '#dda0dd',
  lavender: '#e6e6fa',
  slateblue: '#6a5acd',
  royalblue: '#4169e1',
  dodgerblue: '#1e90ff',
  deepskyblue: '#00bfff',
  skyblue: '#87ceeb',
  steelblue: '#4682b4',
  turquoise: '#40e0d0',
  aquamarine: '#7fffd4',
  seagreen: '#2e8b57',
  forestgreen: '#228b22',
  limegreen: '#32cd32',
  chartreuse: '#7fff00',
  greenyellow: '#adff2f',
  darkgreen: '#006400',
  brown: '#a52a2a',
  chocolate: '#d2691e',
  peru: '#cd853f',
  sienna: '#a0522d',
  tan: '#d2b48c',
  wheat: '#f5deb3',
  beige: '#f5f5dc',
  ivory: '#fffff0',
  goldenrod: '#daa520',
  firebrick: '#b22222',
  indianred: '#cd5c5c',
  darkred: '#8b0000',
  midnightblue: '#191970',
  darkslategray: '#2f4f4f',
  dimgray: '#696969',
  lightgray: '#d3d3d3',
  gainsboro: '#dcdcdc',
  whitesmoke: '#f5f5f5',
  aliceblue: '#f0f8ff',
  lightblue: '#add8e6',
  powderblue: '#b0e0e6',
  cadetblue: '#5f9ea0',
  mediumpurple: '#9370db',
  rebeccapurple: '#663399',
  darkviolet: '#9400d3',
  mediumseagreen: '#3cb371',
  yellowgreen: '#9acd32',
  darkkhaki: '#bdb76b',
  lightyellow: '#ffffe0',
  moccasin: '#ffe4b5',
  bisque: '#ffe4c4',
  navajowhite: '#ffdead',
  mistyrose: '#ffe4e1',
  lightpink: '#ffb6c1',
  thistle: '#d8bfd8',
  mediumvioletred: '#c71585',
  slategray: '#708090',
  lightseagreen: '#20b2aa',
  mediumaquamarine: '#66cdaa',
  darkcyan: '#008b8b',
  cornflowerblue: '#6495ed',
};

function distanceSq(a: Rgb, b: Rgb): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

export interface NamedColor {
  name: string;
  hex: string;
  exact: boolean;
  distance: number;
}

/** Find the nearest CSS named colour to `hex`. Returns null for invalid input. */
export function nearestColorName(hex: string): NamedColor | null {
  const target = parseHex(hex);
  if (!target) return null;

  let best: { name: string; hex: string; dist: number } | null = null;
  for (const [name, value] of Object.entries(CSS_COLORS)) {
    const rgb = parseHex(value)!;
    const dist = distanceSq(target, rgb);
    if (!best || dist < best.dist) best = { name, hex: value, dist };
  }
  if (!best) return null;
  return {
    name: best.name,
    hex: best.hex,
    exact: best.dist === 0,
    distance: Math.sqrt(best.dist),
  };
}
