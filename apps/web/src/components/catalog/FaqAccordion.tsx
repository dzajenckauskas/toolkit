'use client';

import styled from '@emotion/styled';

/**
 * Keyboard-accessible FAQ accordion built on native <details>/<summary> (works
 * with zero JS). Shared by the standalone FAQ page and each tool page's
 * "Frequent questions" section so they look and behave identically.
 */

export interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const List = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(2),
}));

const Details = styled('details')(({ theme }) => ({
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  overflow: 'hidden',
  '&[open]': {
    borderColor: `color-mix(in srgb, ${theme.color.accent} 40%, ${theme.color.border})`,
  },
}));

const Summary = styled('summary')(({ theme }) => ({
  listStyle: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(3),
  padding: `${theme.space(4)} ${theme.space(5)}`,
  fontWeight: 600,
  color: theme.color.text,
  '&::-webkit-details-marker': { display: 'none' },
  '&:hover': { color: theme.color.accentStrong },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${theme.color.accent} 45%, transparent)`,
  },
  // Chevron that rotates when the item is open.
  '& .chev': {
    flex: 'none',
    transition: 'transform 0.2s ease',
    color: theme.color.subtle,
  },
  'details[open] &  .chev': { transform: 'rotate(180deg)' },
}));

const Answer = styled('div')(({ theme }) => ({
  padding: `0 ${theme.space(5)} ${theme.space(5)}`,
  color: theme.color.muted,
  lineHeight: 1.7,
  '& a': { color: theme.color.accentStrong, fontWeight: 600 },
}));

export function FaqAccordion({
  items,
  testIdPrefix = 'faq-item',
}: {
  items: FaqItem[];
  testIdPrefix?: string;
}) {
  return (
    <List>
      {items.map(({ q, a }, i) => (
        <Details key={i} data-testid={`${testIdPrefix}-${i}`}>
          <Summary>
            {q}
            <svg
              className="chev"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </Summary>
          <Answer>{a}</Answer>
        </Details>
      ))}
    </List>
  );
}
