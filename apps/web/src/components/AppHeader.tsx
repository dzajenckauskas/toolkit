'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import { Logo } from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import MobileMenu from '@/components/MobileMenu';

/**
 * Persistent top navigation. Logo (→ home), a couple of quick links on wider
 * screens, a theme toggle, and a menu button that opens the category drawer.
 */

const QUICK_LINKS = [
  { href: '/optimize', label: 'Compress' },
  { href: '/crop', label: 'Crop' },
  { href: '/palette', label: 'Palette' },
] as const;

const Bar = styled('header')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 40,
  borderBottom: `1px solid ${theme.color.border}`,
  background: `color-mix(in srgb, ${theme.color.surface} 88%, transparent)`,
  backdropFilter: 'saturate(1.2) blur(8px)',
}));

const Inner = styled('div')({
  maxWidth: 1080,
  margin: '0 auto',
  padding: '0.6rem 1.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
});

const Brand = styled(Link)({
  textDecoration: 'none',
  display: 'inline-flex',
  borderRadius: '0.7rem',
  '&:focus-visible': {
    outline: 'none',
    boxShadow: '0 0 0 3px color-mix(in srgb, var(--accent) 32%, transparent)',
  },
});

const Right = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
}));

const QuickNav = styled('nav')(({ theme }) => ({
  display: 'none',
  gap: theme.space(1),
  marginRight: theme.space(2),
  '@media (min-width: 720px)': { display: 'flex' },
}));

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  padding: '0.5rem 0.75rem',
  borderRadius: '0.6rem',
  fontWeight: 600,
  fontSize: '0.875rem',
  textDecoration: 'none',
  transition: 'color 0.2s ease, background-color 0.2s ease',
  color: active ? theme.color.text : theme.color.muted,
  background: active ? `color-mix(in srgb, ${theme.color.accent} 14%, transparent)` : 'transparent',
  '&:hover': {
    color: theme.color.text,
    background: active
      ? `color-mix(in srgb, ${theme.color.accent} 14%, transparent)`
      : `color-mix(in srgb, ${theme.color.surface} 75%, transparent)`,
  },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
  },
}));

const IconButton = styled('button')(({ theme }) => ({
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
  '&:hover': { borderColor: theme.color.accent },
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
  },
}));

export function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Bar>
      <Inner>
        <Brand href="/" aria-label="toolkit — home" data-testid="brand-home">
          <Logo />
        </Brand>

        <Right>
          <QuickNav aria-label="Quick links">
            {QUICK_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                active={pathname === link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </NavLink>
            ))}
          </QuickNav>

          <ThemeToggle />

          <IconButton
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            data-testid="menu-open"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </IconButton>
        </Right>
      </Inner>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </Bar>
  );
}
