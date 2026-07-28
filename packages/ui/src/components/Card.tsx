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
  // danielius surfaces are generously rounded with a soft, tight-spread shadow.
  borderRadius: theme.radius.lg,
  background: tone === 'danger' ? theme.color.dangerBg : theme.color.surface,
  boxShadow:
    tone === 'danger'
      ? 'none'
      : '0 16px 40px -34px color-mix(in srgb, var(--text) 50%, transparent)',
  padding: theme.space(5),
}));
