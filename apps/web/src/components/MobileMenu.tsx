'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import styled from '@emotion/styled';
import { toolsByCategory } from '@toolkit/tools/registry';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Logo } from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { CONTACT_MAILTO } from '@/lib/site';
import type { AppTheme } from '@toolkit/ui';

/**
 * Slide-in navigation drawer (mobile / narrow screens).
 *
 * Portalled to <body>: the drawer is `position: fixed`, and the app header sets
 * `backdrop-filter`, which makes the header a *containing block* for fixed
 * descendants. Rendered inside the header the drawer would be clipped to the
 * header's height — so it must live at the document root instead.
 *
 * The single fixed, viewport-sized Root (`inset: 0`, `overflow: hidden`) is the
 * drawer's own clipping context, so the panel sliding in from off the left edge
 * cannot widen the document. When closed the whole thing is inert and, after the
 * slide-out finishes, `visibility: hidden` so its links leave the tab order.
 */

const Root = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open }) => ({
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',
  zIndex: 50,
  pointerEvents: open ? 'auto' : 'none',
  visibility: open ? 'visible' : 'hidden',
  transition: open ? 'visibility 0s' : 'visibility 0s linear 0.24s',
}));

const Overlay = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  position: 'absolute',
  inset: 0,
  background: theme.color.overlay,
  opacity: open ? 1 : 0,
  transition: 'opacity 0.24s ease',
}));

const Panel = styled('aside', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  width: 'min(320px, 85vw)',
  background: theme.color.surface,
  borderRight: `1px solid ${theme.color.border}`,
  boxShadow: theme.shadow,
  transform: open ? 'translateX(0)' : 'translateX(-100%)',
  transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
}));

const Head = styled('div')(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${theme.space(3)} ${theme.space(4)}`,
  borderBottom: `1px solid ${theme.color.border}`,
}));

const Close = styled('button')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.2rem',
  height: '2.2rem',
  color: theme.color.text,
  background: 'transparent',
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  cursor: 'pointer',
  '&:hover': { borderColor: theme.color.accent },
}));

const Body = styled('nav')({
  flex: '1 1 auto',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
});

const SectionLabel = styled('div')(({ theme }) => ({
  padding: `${theme.space(3)} ${theme.space(4)} ${theme.space(1)}`,
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: theme.color.muted,
}));

const catHeaderStyles = (theme: AppTheme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(3),
  padding: `${theme.space(3)} ${theme.space(4)} ${theme.space(1)}`,
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  color: theme.color.muted,
  textDecoration: 'none',
  '& svg': { color: theme.color.muted },
  '&:hover': { color: theme.color.text },
});

// Category label doubles as a jump-link to that section of the home catalog.
const CatHeader = styled(Link)(({ theme }) => catHeaderStyles(theme));

const itemStyles = (theme: AppTheme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(3),
  padding: `${theme.space(2)} ${theme.space(4)}`,
  color: theme.color.text,
  textDecoration: 'none',
  fontWeight: 600,
  '& svg': { color: theme.color.muted },
  '&:hover': { background: theme.color.surface2 },
});

const Item = styled(Link)(({ theme }) => itemStyles(theme));

// Individual tool link, indented under its category.
const ToolLink = styled(Link)(({ theme }) => ({
  display: 'block',
  padding: `${theme.space(2)} ${theme.space(4)} ${theme.space(2)} ${theme.space(9)}`,
  color: theme.color.text,
  textDecoration: 'none',
  fontSize: '0.92rem',
  '&:hover': { background: theme.color.surface2 },
}));

const Foot = styled('div')(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(3),
  padding: `${theme.space(3)} ${theme.space(4)}`,
  borderTop: `1px solid ${theme.color.border}`,
}));

const Feedback = styled('a')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.space(2),
  color: theme.color.muted,
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 600,
  '&:hover': { color: theme.color.text },
}));

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const groups = toolsByCategory();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <Root open={open} data-testid="menu-root">
      <Overlay open={open} onClick={onClose} data-testid="menu-overlay" aria-hidden={!open} />
      <Panel
        open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        data-testid="mobile-menu"
      >
        <Head>
          <Logo size={22} />
          <Close type="button" onClick={onClose} aria-label="Close menu" data-testid="menu-close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Close>
        </Head>

        <Body aria-label="Tools">
          <Item href="/" onClick={onClose} data-testid="menu-home">
            <CategoryIcon category="Productivity" />
            All tools
          </Item>

          {groups.map((group) => (
            <div key={group.category}>
              <CatHeader
                href={`/#cat-${group.category}`}
                onClick={onClose}
                data-testid={`menu-cat-${group.category}`}
              >
                <CategoryIcon category={group.category} />
                {group.category}
              </CatHeader>
              {group.tools
                .filter((tool) => tool.status === 'live')
                .map((tool) => (
                  <ToolLink
                    key={tool.id}
                    href={tool.href}
                    onClick={onClose}
                    data-testid={`menu-tool-${tool.id}`}
                  >
                    {tool.name}
                  </ToolLink>
                ))}
            </div>
          ))}

          <SectionLabel>More</SectionLabel>
          <Item href="/faq" onClick={onClose} data-testid="menu-faq">
            <CategoryIcon category="Text & Documents" />
            FAQ
          </Item>
          <Item href="/terms" onClick={onClose} data-testid="menu-terms">
            <CategoryIcon category="Developer" />
            Terms &amp; Conditions
          </Item>
        </Body>

        <Foot>
          <ThemeToggle testId="menu-theme-toggle" />
          <Feedback href={CONTACT_MAILTO} data-testid="menu-contact">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Send feedback
          </Feedback>
        </Foot>
      </Panel>
    </Root>,
    document.body,
  );
}
