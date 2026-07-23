'use client';

import styled from '@emotion/styled';

/** Surface container with the standard border/radius/background. */
export interface CardProps {
  tone?: 'default' | 'danger';
}

export const Card = styled('div', {
  shouldForwardProp: (prop) => prop !== 'tone',
})<CardProps>(({ theme, tone = 'default' }) => ({
  border: `1px solid ${tone === 'danger' ? theme.color.dangerBorder : theme.color.border}`,
  borderRadius: theme.radius.md,
  background: tone === 'danger' ? theme.color.dangerBg : theme.color.surface,
  padding: theme.space(5),
}));
