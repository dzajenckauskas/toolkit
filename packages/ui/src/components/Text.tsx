'use client';

import styled from '@emotion/styled';

/**
 * Typography primitive. `tone` and `size` cover body/muted/error text and the
 * small-caps meta labels used across the tool.
 */
export interface TextProps {
  tone?: 'default' | 'muted' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  weight?: number;
  numeric?: boolean;
}

const toneColor = {
  default: 'text',
  muted: 'muted',
  subtle: 'subtle',
  danger: 'dangerText',
} as const;

const sizeValue = {
  sm: '0.85rem',
  md: '1rem',
  lg: '1.1rem',
} as const;

export const Text = styled('p', {
  shouldForwardProp: (prop) => !['tone', 'size', 'weight', 'numeric'].includes(prop),
})<TextProps>(({ theme, tone = 'default', size = 'md', weight, numeric }) => ({
  margin: 0,
  color: theme.color[toneColor[tone]],
  fontSize: sizeValue[size],
  fontWeight: weight,
  // Numeric readouts use Geist Mono (danielius' meta/numeral face) with
  // tabular figures so digits stay aligned as values change.
  fontFamily: numeric ? theme.font.mono : undefined,
  fontVariantNumeric: numeric ? 'tabular-nums' : undefined,
}));
