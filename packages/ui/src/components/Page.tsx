'use client';

import styled from '@emotion/styled';

/** Centered page container. `wide` gives a roomier layout for the catalog. */
export const Page = styled('main', {
  shouldForwardProp: (prop) => prop !== 'wide',
})<{ wide?: boolean }>(({ wide }) => ({
  // `width: 100%` is load-bearing: <Page> is a flex item of the body's column
  // layout, and its `margin: 0 auto` puts auto margins on the flex cross axis,
  // which cancels the default stretch. Without an explicit width the main would
  // shrink-wrap to its widest line, so the column width jumped as content
  // changed (e.g. expanding an FAQ item). A definite width keeps it constant.
  width: '100%',
  maxWidth: wide ? '1080px' : '720px',
  margin: '0 auto',
  padding: '2rem 1.25rem 4rem',
}));
