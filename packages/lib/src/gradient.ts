/**
 * CSS gradient construction. Pure; works anywhere.
 */

export type GradientType = 'linear' | 'radial';

export interface GradientStop {
  color: string;
  /** 0–100 percent. */
  position: number;
}

function stopsCss(stops: GradientStop[]): string {
  return [...stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${Math.round(s.position)}%`)
    .join(', ');
}

/** Build a CSS gradient value (the part after `background:`). */
export function gradientCss(type: GradientType, angle: number, stops: GradientStop[]): string {
  const body = stopsCss(stops);
  return type === 'linear'
    ? `linear-gradient(${Math.round(angle)}deg, ${body})`
    : `radial-gradient(circle, ${body})`;
}
