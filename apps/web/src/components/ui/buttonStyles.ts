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
  const isPrimary = variant === 'primary';
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    // danielius buttons are pills, ink-filled for primary, bordered for ghost.
    borderRadius: theme.radius.pill,
    fontWeight: 600,
    lineHeight: 1.2,
    textDecoration: 'none',
    cursor: 'pointer',
    border: '1px solid transparent',
    textAlign: 'center',
    padding: size === 'sm' ? '0.45rem 1rem' : '0.7rem 1.5rem',
    fontSize: size === 'sm' ? '0.8rem' : '0.9rem',
    background: isPrimary ? theme.color.accent : 'transparent',
    color: isPrimary ? theme.color.accentContrast : theme.color.text,
    borderColor: isPrimary ? 'transparent' : theme.color.border,
    transition:
      'color 0.25s ease, background-color 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
    '&:hover': isPrimary
      ? {
          background: theme.color.accentStrong,
          transform: 'translateY(-2px)',
          boxShadow: `0 12px 30px -14px ${theme.color.accent}`,
        }
      : {
          borderColor: theme.color.accent,
          color: theme.color.accentStrong,
          transform: 'translateY(-2px)',
        },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  };
}

/** Props Emotion must not forward to the DOM for anchor-based buttons. */
export const isButtonStyleProp = (prop: string): boolean => prop === 'variant' || prop === 'size';
