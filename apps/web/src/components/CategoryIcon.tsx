import type { ToolCategory } from '@/tools/registry';

/**
 * Small, dependency-free line icon per tool category, used in the command
 * palette. Inherits `currentColor` so it themes automatically.
 */
const PATHS: Record<ToolCategory, React.ReactNode> = {
  'Images & Media': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </>
  ),
  'Text & Documents': <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />,
  PDF: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v4h4" />
    </>
  ),
  Developer: <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  Design: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  Privacy: <path d="M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z" />,
  Productivity: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  Calculators: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2" strokeLinecap="round" />
    </>
  ),
};

export function CategoryIcon({ category }: { category: ToolCategory }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      {PATHS[category]}
    </svg>
  );
}
