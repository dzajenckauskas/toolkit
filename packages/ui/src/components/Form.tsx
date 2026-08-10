'use client';

import styled from '@emotion/styled';
import type { AppTheme } from '../theme/theme';

const controlStyles = (theme: AppTheme) => ({
  width: '100%',
  padding: '0.7rem 0.9rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  fontSize: '1rem',
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
});

/** File input kept in the accessibility tree while its visible trigger is rendered elsewhere. */
export const HiddenFileInput = styled('input')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

/** Compact horizontal label used for checkboxes, sliders, and short tool controls. */
export const InlineField = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
  color: theme.color.muted,
  fontSize: '0.9rem',
  fontWeight: 600,
}));

/** Standard single-line text control. Extend it locally only for feature-specific geometry. */
export const TextInput = styled('input')(({ theme }) => controlStyles(theme));

/** Compact numeric control used when a full-width field would obscure the value's scale. */
export const NumberInput = styled(TextInput)({
  width: '5rem',
  padding: '0.4rem 0.6rem',
});

/** Standard multi-line text control. */
export const TextArea = styled('textarea')(({ theme }) => ({
  ...controlStyles(theme),
  minHeight: '8rem',
  padding: theme.space(3),
  borderColor: theme.color.border,
  fontSize: '0.95rem',
  resize: 'vertical',
}));

/** Monospaced multi-line control for code, encoded data, and machine-readable text. */
export const CodeTextArea = styled(TextArea)(({ theme }) => ({
  fontFamily: theme.font.mono,
  fontSize: '0.9rem',
}));

/** Monospaced short text input, primarily for colours and machine-readable values. */
export const CodeInput = styled('input')(({ theme }) => ({
  ...controlStyles(theme),
  width: '8rem',
  padding: '0.5rem 0.7rem',
  fontFamily: theme.font.mono,
}));
