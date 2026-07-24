'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { applyMode, resolveMode, type ThemeMode } from '@/lib/theme-mode';

const Button = styled('button')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.4rem',
  height: '2.4rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  cursor: 'pointer',
  transition: 'border-color 0.12s ease, background 0.12s ease',
  '&:hover': { borderColor: theme.color.accent },
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
  },
}));

const Sun = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

const Moon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(resolveMode());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    applyMode(next);
    setMode(next);
  };

  // Avoid a hydration mismatch: render a stable icon until mounted.
  const showMoon = mounted && mode === 'light';

  return (
    <Button
      type="button"
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
      data-testid="theme-toggle"
    >
      {showMoon ? Moon : Sun}
    </Button>
  );
}
