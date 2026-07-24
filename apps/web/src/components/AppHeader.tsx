'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';

/**
 * Persistent top navigation across the toolkit. Shows the brand (links home)
 * and a link per tool, with the current tool highlighted. Client component so
 * it can read the active route via usePathname.
 */

const TOOLS = [
  { href: '/optimize', label: 'Optimize' },
  { href: '/crop', label: 'Crop' },
] as const;

const Bar = styled('header')(({ theme }) => ({
  borderBottom: `1px solid ${theme.color.border}`,
  background: theme.color.surface,
}));

const Inner = styled('div')({
  maxWidth: 720,
  margin: '0 auto',
  padding: '0.75rem 1.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
});

const Brand = styled(Link)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: theme.color.text,
  textDecoration: 'none',
}));

const Nav = styled('nav')({
  display: 'flex',
  gap: '0.25rem',
});

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  padding: '0.4rem 0.7rem',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '0.9rem',
  textDecoration: 'none',
  color: active ? theme.color.accent : theme.color.muted,
  background: active ? `color-mix(in srgb, ${theme.color.accent} 10%, transparent)` : 'transparent',
  '&:hover': { color: theme.color.text },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

export function AppHeader() {
  const pathname = usePathname();
  return (
    <Bar>
      <Inner>
        <Brand href="/">Ecommerce Toolkit</Brand>
        <Nav aria-label="Tools">
          {TOOLS.map((tool) => {
            const active = pathname === tool.href;
            return (
              <NavLink
                key={tool.href}
                href={tool.href}
                active={active}
                aria-current={active ? 'page' : undefined}
                data-testid={`nav-${tool.label.toLowerCase()}`}
              >
                {tool.label}
              </NavLink>
            );
          })}
        </Nav>
      </Inner>
    </Bar>
  );
}
