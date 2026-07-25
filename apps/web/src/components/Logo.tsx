import styled from '@emotion/styled';

/**
 * The "toolkit" brand: a hand-drawn glasses doodle (recreated as SVG paths from
 * the source strokes) plus the wordmark. `stroke`/`color` inherit currentColor
 * so it themes automatically.
 */

// Stroke paths traced from the doodle source (normalised coords × 100).
const GLASSES_PATHS = [
  'M 51.73 38.76 L 52.15 38.49 L 50.95 38.91 L 52.29 38.45 L 52.36 38.45 L 52.22 38.61 L 52.01 38.71 L 51.8 38.76 L 51.59 38.65 L 51.37 38.34 L 51.16 37.93 L 50.88 37.46 L 50.45 36.99 L 49.96 36.52 L 49.47 36.01 L 48.97 35.27 L 48.33 34.66 L 47.63 34.4 L 46.57 34.34 L 45.51 34.5 L 44.38 34.66 L 43.1 34.92 L 41.9 35.18 L 40.84 35.54 L 39.92 36.16 L 39.15 36.99 L 38.37 37.83 L 37.66 38.8 L 37.24 39.85 L 37.17 40.88 L 37.45 42.08 L 38.44 43.22 L 39.92 44.15 L 41.76 44.87 L 43.81 45.29 L 45.79 45.29 L 47.84 44.93 L 49.75 44.15 L 51.09 43.11 L 51.94 42.08 L 52.15 41.09 L 52.01 40.06 L 51.37 38.76 L 50.95 37.98',
  'M 67.42 36.16 L 67.21 36.1 L 66.78 36.06 L 66.57 35.91 L 66.22 35.69 L 65.58 35.59 L 64.52 35.59 L 63.25 35.75 L 61.76 36.1 L 60.63 36.52 L 59.78 37.1 L 59.01 37.98 L 58.3 39.02 L 57.66 40.15 L 57.38 41.15 L 57.45 41.98 L 58.09 42.91 L 59.36 43.9 L 60.99 44.68 L 62.96 45.14 L 64.87 45.24 L 66.5 45.03 L 67.77 44.36 L 68.76 43.37 L 69.47 42.34 L 69.96 41.34 L 70.17 40.41 L 69.96 39.64 L 69.26 38.76 L 68.34 37.67 L 67.42 36.52 L 66.5 35.59 L 65.65 35.12',
  'M 52.5 39.02 L 52.36 39.02 L 52.22 38.96 L 52.22 38.86 L 52.29 38.71 L 52.36 38.65 L 52.5 38.61 L 52.58 38.61 L 52.58 38.54 L 52.65 38.49 L 52.79 38.39 L 53.07 38.24 L 53.42 38.13 L 53.99 38.08 L 54.84 38.03 L 55.83 38.03 L 56.82 38.39 L 57.1 38.54',
  'M 70.88 40.47 L 70.74 40.56 L 70.6 40.56 L 70.53 40.63 L 70.74 40.52 L 71.23 40.41 L 71.73 40.26 L 72.29 40.26 L 72.93 40.32 L 73.71 40.52 L 73.85 40.63',
  'M 27.84 37.71 L 27.56 37.71 L 27.84 37.71 L 27.2 37.71 L 26.99 37.88 L 26.78 38.03 L 26.64 38.13 L 26.64 38.18 L 26.78 38.24 L 27.2 38.34 L 28.19 38.39 L 29.68 38.39 L 31.94 38.49 L 33.85 38.71',
];

const VIEW_BOX = '24.6 32.3 51.2 15';
const ASPECT = 51.2 / 15;

export function GlassesMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size * ASPECT}
      height={size}
      viewBox={VIEW_BOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {GLASSES_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

const Wrap = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.space(2),
  color: theme.color.text,
}));

// const Word = styled('span')({
//   fontSize: '1.2rem',
//   fontWeight: 900,
//   letterSpacing: '-0.01em',
// });

export function Logo({ size = 24 }: { size?: number }) {
  return (
    <Wrap>
      <GlassesMark size={size} />
      {/* <Word>toolkit</Word> */}
    </Wrap>
  );
}
