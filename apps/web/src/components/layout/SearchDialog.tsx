'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { useToolSearch } from '@/components/search/useToolSearch';
import { ToolResults } from '@/components/search/ToolResults';

/**
 * Global search / command palette. Unlike the inline catalog search (which only
 * lives on the home page), this is rendered from the header and works on every
 * route. It shares its query logic (`useToolSearch`) and result rows
 * (`ToolResults`) with the catalog so the two stay identical.
 *
 * Portalled to <body> so the header's `backdrop-filter` — which establishes a
 * containing block for fixed descendants — cannot trap it.
 */

const Root = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: 60,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '10vh 1rem 1rem',
  pointerEvents: open ? 'auto' : 'none',
  visibility: open ? 'visible' : 'hidden',
  transition: open ? 'visibility 0s' : 'visibility 0s linear 0.18s',
}));

const Overlay = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  position: 'absolute',
  inset: 0,
  background: theme.color.overlay,
  opacity: open ? 1 : 0,
  transition: 'opacity 0.18s ease',
}));

const Panel = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  position: 'relative',
  width: 'min(560px, 100%)',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow,
  overflow: 'hidden',
  opacity: open ? 1 : 0,
  transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
  transition: 'opacity 0.18s ease, transform 0.18s ease',
}));

const InputRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(3),
  padding: `${theme.space(3)} ${theme.space(4)}`,
  borderBottom: `1px solid ${theme.color.border}`,
  '& > svg': { flex: '0 0 auto', color: theme.color.muted },
}));

const Input = styled('input')(({ theme }) => ({
  flex: '1 1 auto',
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: theme.color.text,
  fontSize: '1.05rem',
  '&::placeholder': { color: theme.color.muted },
}));

const EscHint = styled('kbd')(({ theme }) => ({
  flex: '0 0 auto',
  fontFamily: 'inherit',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: theme.color.muted,
  border: `1px solid ${theme.color.border}`,
  borderRadius: '6px',
  padding: '0.1rem 0.4rem',
}));

const Scroll = styled('div')({ overflowY: 'auto' });

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { query, setQuery, results, selected, setSelected, onKeyDown } = useToolSearch({
    alwaysActive: true,
    onSelect: (tool) => {
      router.push(tool.href);
      onClose();
    },
    onEscape: onClose,
  });

  useEffect(() => setMounted(true), []);

  // Reset and focus each time the dialog opens; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open, setQuery, setSelected]);

  if (!mounted) return null;

  return createPortal(
    <Root open={open} data-testid="search-root">
      <Overlay open={open} onClick={onClose} data-testid="search-overlay" aria-hidden={!open} />
      <Panel
        open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        aria-hidden={!open}
        data-testid="search-dialog"
      >
        <InputRow>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools and actions…"
            aria-label="Search tools and actions"
            role="combobox"
            aria-expanded
            aria-controls="search-results"
            data-testid="search-input"
          />
          <EscHint aria-hidden>Esc</EscHint>
        </InputRow>

        <Scroll>
          <ToolResults
            results={results}
            selected={selected}
            onHover={setSelected}
            onNavigate={onClose}
            query={query}
            testIdPrefix="search-result"
            emptyTestId="search-empty"
            listId="search-results"
          />
        </Scroll>
      </Panel>
    </Root>,
    document.body,
  );
}
