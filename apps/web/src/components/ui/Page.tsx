'use client';

import styled from '@emotion/styled';

/** Centered page container. `wide` gives a roomier layout for the catalog. */
export const Page = styled('main', {
  shouldForwardProp: (prop) => prop !== 'wide',
})<{ wide?: boolean }>(({ wide }) => ({
  maxWidth: wide ? '1080px' : '720px',
  margin: '0 auto',
  padding: '2rem 1.25rem 4rem',
}));
