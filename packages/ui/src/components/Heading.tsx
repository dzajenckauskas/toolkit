'use client';

import styled from '@emotion/styled';

/** Page heading — danielius' heavy, tightly-tracked display type. */
export const Heading = styled('h1')(({ theme }) => ({
  margin: `0 0 ${theme.space(1)}`,
  fontSize: 'clamp(1.9rem, 4.6vw, 2.7rem)',
  fontWeight: 900,
  letterSpacing: '-0.04em',
  lineHeight: 1.02,
  color: theme.color.text,
}));
