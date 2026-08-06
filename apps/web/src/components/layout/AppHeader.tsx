'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import type { CSSObject } from '@emotion/react';
import type { AppTheme } from '@toolkit/ui';
import { Logo } from '@/components/layout/Logo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import MobileMenu from '@/components/layout/MobileMenu';
import SearchDialog from '@/components/layout/SearchDialog';
import { CONTACT_MAILTO } from '@/lib/site';

/**
 * Persistent top navigation. Logo (→ home), a couple of quick links on wider
 * screens, a theme toggle, and a menu button that opens the category drawer.
 */

const QUICK_LINKS = [
  { href: '/faq', label: 'FAQ', external: false },
  { href: CONTACT_MAILTO, label: 'Contact', external: true },
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

const Brand = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  display: 'inline-flex',
  borderRadius: theme.radius.sm,
  '&:focus-visible': {
    outline: 'none',
    boxShadow: '0 0 0 3px color-mix(in srgb, var(--accent) 32%, transparent)',
  },
}));

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

const navLinkStyles = (theme: AppTheme, active?: boolean): CSSObject => ({
  padding: '0.5rem 0.75rem',
  borderRadius: theme.radius.sm,
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
});

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => navLinkStyles(theme, active));

// Anchor variant for external / mailto quick links (Next's Link is for
// internal navigation only).
const NavAnchor = styled('a')(({ theme }) => navLinkStyles(theme));

const IconButton = styled('button')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.4rem',
  height: '2.4rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: '50%',
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
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl-K opens the global search from anywhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Bar>
      <Inner>
        <Brand href="/" aria-label="Toolkit — home" data-testid="brand-home">
          <Logo />
        </Brand>

        <Right>
          <QuickNav aria-label="Quick links">
            {QUICK_LINKS.map((link) =>
              link.external ? (
                <NavAnchor key={link.href} href={link.href} data-testid={`nav-${link.label}`}>
                  {link.label}
                </NavAnchor>
              ) : (
                <NavLink
                  key={link.href}
                  href={link.href}
                  active={pathname === link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  data-testid={`nav-${link.label}`}
                >
                  {link.label}
                </NavLink>
              ),
            )}
          </QuickNav>

          <IconButton
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search tools"
            aria-expanded={searchOpen}
            data-testid="search-open"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </IconButton>

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
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Bar>
  );
}
