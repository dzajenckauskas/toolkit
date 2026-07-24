'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { CATEGORY_ORDER } from '@/tools/registry';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Logo } from '@/components/Logo';

const Overlay = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  position: 'fixed',
  inset: 0,
  background: theme.color.overlay,
  opacity: open ? 1 : 0,
  visibility: open ? 'visible' : 'hidden',
  transition: 'opacity 0.2s ease, visibility 0.2s ease',
  zIndex: 50,
}));

const Panel = styled('aside', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: 'min(320px, 85vw)',
  background: theme.color.surface,
  borderLeft: `1px solid ${theme.color.border}`,
  boxShadow: theme.shadow,
  transform: open ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 51,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
}));

const Head = styled('div')(({ theme }) => ({
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

const SectionLabel = styled('div')(({ theme }) => ({
  padding: `${theme.space(3)} ${theme.space(4)} ${theme.space(1)}`,
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: theme.color.muted,
}));

const Item = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(3),
  padding: `${theme.space(3)} ${theme.space(4)}`,
  color: theme.color.text,
  textDecoration: 'none',
  fontWeight: 600,
  '& svg': { color: theme.color.muted },
  '&:hover': { background: theme.color.surface2 },
}));

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  return (
    <>
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

        <SectionLabel>Browse</SectionLabel>
        <Item href="/" onClick={onClose} data-testid="menu-home">
          <CategoryIcon category="Productivity" />
          All tools
        </Item>

        <SectionLabel>Categories</SectionLabel>
        {CATEGORY_ORDER.map((category) => (
          <Item
            key={category}
            href={`/#cat-${category}`}
            onClick={onClose}
            data-testid={`menu-cat-${category}`}
          >
            <CategoryIcon category={category} />
            {category}
          </Item>
        ))}
      </Panel>
    </>
  );
}
