'use client';

import styled from '@emotion/styled';

/** Page heading — fluid size, tight to its supporting text. */
export const Heading = styled('h1')(({ theme }) => ({
  margin: `0 0 ${theme.space(1)}`,
  fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
  color: theme.color.text,
}));
