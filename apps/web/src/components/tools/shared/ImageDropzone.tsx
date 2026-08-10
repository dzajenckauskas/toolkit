'use client';

import styled from '@emotion/styled';
import { ButtonVisual } from '@toolkit/ui';

/**
 * The shared upload area for every image tool. A large dashed zone with an
 * upload glyph, a clear call-to-action and a hint line — the whole zone is the
 * button (click, Enter/Space, drag-drop). Tools keep their own file handling and
 * just pass the handlers, so the upload experience is identical across the app.
 */

export interface ImageDropzoneProps {
  active?: boolean;
  onClick: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
  title?: string;
  cta?: string;
  hint?: React.ReactNode;
  ariaLabel?: string;
  testId?: string;
}

const Zone = styled('div', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(2),
  padding: '2.75rem 1.5rem',
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${active ? theme.color.accent : theme.color.borderStrong}`,
  borderRadius: theme.radius.lg,
  background: active
    ? `color-mix(in srgb, ${theme.color.accent} 9%, ${theme.color.surface})`
    : theme.color.surface,
  transition: 'border-color 0.15s ease, background 0.15s ease',
  '&:hover': {
    borderColor: theme.color.accent,
    background: `color-mix(in srgb, ${theme.color.accent} 5%, ${theme.color.surface})`,
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

const IconCircle = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '3rem',
  height: '3rem',
  marginBottom: theme.space(1),
  color: theme.color.accent,
  background: `color-mix(in srgb, ${theme.color.accent} 12%, transparent)`,
  borderRadius: theme.radius.pill,
}));

const Title = styled('span')(({ theme }) => ({
  fontWeight: 600,
  color: theme.color.text,
}));

// Looks like a primary button but is not interactive — the whole zone handles
// the click, so a nested button would be a redundant tab stop.
const Cta = styled(ButtonVisual)(({ theme }) => ({
  marginTop: theme.space(1),
  fontWeight: 700,
  cursor: 'inherit',
  pointerEvents: 'none',
  '&:hover': {
    color: theme.color.accentContrast,
    background: theme.color.accent,
    transform: 'none',
    boxShadow: 'none',
  },
}));

const Hint = styled('span')(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.color.muted,
}));

export function ImageDropzone({
  active,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
  title = 'Drop an image here',
  cta = 'Select image',
  hint,
  ariaLabel = 'Add an image by choosing a file, dropping it, or pasting',
  testId,
}: ImageDropzoneProps) {
  return (
    <Zone
      active={active}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-testid={testId}
    >
      <IconCircle aria-hidden>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
        </svg>
      </IconCircle>
      <Title>{title}</Title>
      <Cta variant="primary" aria-hidden data-testid={testId ? `${testId}-cta` : undefined}>
        {cta}
      </Cta>
      {hint ? <Hint>{hint}</Hint> : null}
    </Zone>
  );
}
