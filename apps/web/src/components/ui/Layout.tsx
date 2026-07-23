'use client';

import styled from '@emotion/styled';

/** Centered page container. */
export const Page = styled('main')({
  maxWidth: '720px',
  margin: '0 auto',
  padding: '2rem 1.25rem 4rem',
});

/** Page heading — fluid size, tight to its supporting text. */
export const Heading = styled('h1')(({ theme }) => ({
  margin: `0 0 ${theme.space(1)}`,
  fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
  color: theme.color.text,
}));
