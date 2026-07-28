'use client';

import styled from '@emotion/styled';

/**
 * Shared prose styling for long-form legal / informational pages (Terms).
 * Kept intentionally simple: readable measure, spaced headings and lists.
 */
export const Prose = styled('div')(({ theme }) => ({
  maxWidth: '46rem',
  color: theme.color.muted,
  lineHeight: 1.7,
  '& h2': {
    margin: `${theme.space(8)} 0 ${theme.space(2)}`,
    fontSize: '1.15rem',
    fontWeight: 900,
    letterSpacing: '-0.01em',
    color: theme.color.text,
  },
  '& p': { margin: `0 0 ${theme.space(3)}` },
  '& ul': { margin: `0 0 ${theme.space(3)}`, paddingLeft: theme.space(5) },
  '& li': { margin: `0 0 ${theme.space(2)}` },
  '& a': { color: theme.color.accentStrong, fontWeight: 600 },
  '& strong': { color: theme.color.text, fontWeight: 600 },
}));
