/**
 * Screenshot-frame geometry + background presets. `framedSize` is pure and
 * unit-tested; the canvas compositing lives in the component. Each background
 * has a `css` string (for the live preview) and `stops` (for canvas rendering:
 * one stop = solid fill, two = a top-left→bottom-right linear gradient).
 */

export interface FrameOptions {
  padding: number;
  radius: number;
  shadow: number;
  background: string;
}

export interface Background {
  id: string;
  label: string;
  css: string;
  stops: string[];
}

/** Output canvas size for an image of `imgW`×`imgH` with `padding` on each side. */
export function framedSize(
  imgW: number,
  imgH: number,
  padding: number,
): { width: number; height: number } {
  const p = Math.max(0, Math.round(padding));
  return { width: imgW + p * 2, height: imgH + p * 2 };
}

export const BACKGROUNDS: Background[] = [
  {
    id: 'sunset',
    label: 'Sunset',
    css: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
    stops: ['#ff7e5f', '#feb47b'],
  },
  {
    id: 'ocean',
    label: 'Ocean',
    css: 'linear-gradient(135deg, #2b5876, #4e4376)',
    stops: ['#2b5876', '#4e4376'],
  },
  {
    id: 'mint',
    label: 'Mint',
    css: 'linear-gradient(135deg, #43cea2, #185a9d)',
    stops: ['#43cea2', '#185a9d'],
  },
  {
    id: 'grape',
    label: 'Grape',
    css: 'linear-gradient(135deg, #667eea, #764ba2)',
    stops: ['#667eea', '#764ba2'],
  },
  { id: 'slate', label: 'Slate', css: '#1f2933', stops: ['#1f2933'] },
  { id: 'white', label: 'White', css: '#ffffff', stops: ['#ffffff'] },
];
