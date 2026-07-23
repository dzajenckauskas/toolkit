import type { CSSObject } from '@emotion/react';
import type { AppTheme } from '@/theme/theme';

export type ButtonVariant = 'primary' | 'ghost';
export type ButtonSize = 'md' | 'sm';

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Shared button appearance, used by both <button> (Button) and anchor-based
 * buttons (ButtonLink, download links) so they stay visually identical.
 */
export function buttonStyles(
  theme: AppTheme,
  { variant = 'primary', size = 'md' }: ButtonStyleProps,
): CSSObject {
  return {
    display: 'inline-block',
    borderRadius: '8px',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    border: '1px solid transparent',
    textAlign: 'center',
    padding: size === 'sm' ? '0.4rem 0.75rem' : '0.7rem 1.2rem',
    fontSize: size === 'sm' ? '0.85rem' : '1rem',
    background: variant === 'primary' ? theme.color.accent : 'transparent',
    color: variant === 'primary' ? theme.color.accentContrast : theme.color.text,
    borderColor: variant === 'ghost' ? theme.color.borderStrong : 'transparent',
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  };
}

/** Props Emotion must not forward to the DOM for anchor-based buttons. */
export const isButtonStyleProp = (prop: string): boolean => prop === 'variant' || prop === 'size';
