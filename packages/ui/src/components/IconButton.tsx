'use client';

import styled from '@emotion/styled';
import type { ComponentPropsWithoutRef } from 'react';

export type IconButtonSize = 'xs' | 'sm' | 'md';
export type IconButtonVariant = 'surface' | 'ghost';

export interface IconButtonProps extends ComponentPropsWithoutRef<'button'> {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

const dimensions: Record<IconButtonSize, string> = {
  xs: '1.625rem',
  sm: '2.2rem',
  md: '2.4rem',
};

/** Shared geometry and interaction states for controls whose accessible name is represented by an icon. */
export const IconButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'size' && prop !== 'variant',
})<IconButtonProps>(({ theme, size = 'md', variant = 'surface' }) => ({
  appearance: 'none',
  width: dimensions[size],
  height: dimensions[size],
  minWidth: dimensions[size],
  minHeight: dimensions[size],
  padding: 0,
  display: 'inline-flex',
  flex: '0 0 auto',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.color.text,
  background: variant === 'surface' ? theme.color.surface : 'transparent',
  border: `1px solid ${theme.color.border}`,
  borderRadius: '50%',
  lineHeight: 0,
  cursor: 'pointer',
  transition:
    'color .16s ease, background-color .16s ease, border-color .16s ease, box-shadow .16s ease',
  '& > svg': { display: 'block', flex: '0 0 auto' },
  '&:hover': { borderColor: theme.color.accent, color: theme.color.accentStrong },
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
  },
  '&:disabled': { opacity: 0.55, cursor: 'not-allowed' },
}));
