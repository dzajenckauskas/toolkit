'use client';

import styled from '@emotion/styled';

/**
 * Flexbox layout primitive. `direction` and `gap` (in 4px steps) cover the
 * common vertical/horizontal stacking needs without bespoke CSS per screen.
 */
export interface StackProps {
  direction?: 'row' | 'column';
  gap?: number;
  wrap?: boolean;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
}

export const Stack = styled('div', {
  shouldForwardProp: (prop) => !['direction', 'gap', 'wrap', 'align', 'justify'].includes(prop),
})<StackProps>(({ theme, direction = 'column', gap = 0, wrap = false, align, justify }) => ({
  display: 'flex',
  flexDirection: direction,
  gap: theme.space(gap),
  flexWrap: wrap ? 'wrap' : 'nowrap',
  alignItems: align,
  justifyContent: justify,
}));
