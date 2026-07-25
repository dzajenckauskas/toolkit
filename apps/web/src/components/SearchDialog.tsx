'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { searchTools, type Tool } from '@/tools/registry';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { AppTheme } from '@/theme/theme';

/**
 * Global search / command palette. Unlike the inline catalog search (which only
 * lives on the home page), this is rendered from the header and works on every
 * route. It is portalled to <body> so the header's `backdrop-filter` — which
 * establishes a containing block for fixed descendants — cannot trap it.
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

const Results = styled('div')({
  overflowY: 'auto',
});

const Empty = styled('div')(({ theme }) => ({
  padding: `${theme.space(5)} ${theme.space(4)}`,
  color: theme.color.muted,
  textAlign: 'center',
}));

const rowStyles = (theme: AppTheme, selected: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(3),
  padding: `${theme.space(2)} ${theme.space(4)}`,
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  background: selected
    ? `color-mix(in srgb, ${theme.color.accent} 12%, transparent)`
    : 'transparent',
});

const RowLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => rowStyles(theme, selected));

const RowStatic = styled('div', {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  ...rowStyles(theme, selected),
  cursor: 'default',
  opacity: 0.55,
}));

const IconBadge = styled('span')(({ theme }) => ({
  display: 'flex',
  flex: '0 0 auto',
  color: theme.color.muted,
}));

const RowText = styled('div')({ flex: '1 1 auto', minWidth: 0 });

const RowName = styled('div')(({ theme }) => ({ fontWeight: 600, color: theme.color.text }));

const RowDesc = styled('div')(({ theme }) => ({
  fontSize: '0.82rem',
  color: theme.color.muted,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const RowTag = styled('span')(({ theme }) => ({
  flex: '0 0 auto',
  fontSize: '0.78rem',
  color: theme.color.muted,
}));

const Soon = styled('span')(({ theme }) => ({
  flex: '0 0 auto',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  color: theme.color.muted,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.pill,
  padding: '0.1rem 0.5rem',
}));

function ResultRow({
  tool,
  selected,
  onHover,
  onNavigate,
}: {
  tool: Tool;
  selected: boolean;
  onHover: () => void;
  onNavigate: () => void;
}) {
  const inner = (
    <>
      <IconBadge>
        <CategoryIcon category={tool.category} />
      </IconBadge>
      <RowText>
        <RowName>{tool.name}</RowName>
        <RowDesc>{tool.description}</RowDesc>
      </RowText>
      {tool.status === 'planned' ? <Soon>Soon</Soon> : <RowTag>{tool.category}</RowTag>}
    </>
  );

  if (tool.status === 'live') {
    return (
      <RowLink
        href={tool.href}
        selected={selected}
        role="option"
        aria-selected={selected}
        onMouseMove={onHover}
        onClick={onNavigate}
        data-testid={`search-result-${tool.id}`}
      >
        {inner}
      </RowLink>
    );
  }
  return (
    <RowStatic
      selected={selected}
      role="option"
      aria-selected={selected}
      aria-disabled="true"
      onMouseMove={onHover}
      data-testid={`search-result-${tool.id}`}
    >
      {inner}
    </RowStatic>
  );
}

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchTools(query), [query]);

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
  }, [open]);

  useEffect(() => setSelected(0), [query]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (results.length === 0) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelected((i) => (i + 1) % results.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelected((i) => (i - 1 + results.length) % results.length);
      } else if (event.key === 'Enter') {
        const tool = results[selected];
        if (tool && tool.status === 'live') {
          event.preventDefault();
          router.push(tool.href);
          onClose();
        }
      }
    },
    [results, selected, router, onClose],
  );

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

        {results.length === 0 ? (
          <Empty data-testid="search-empty">No tools match “{query}”.</Empty>
        ) : (
          <Results id="search-results" role="listbox" aria-label="Search results">
            {results.map((tool, index) => (
              <ResultRow
                key={tool.id}
                tool={tool}
                selected={index === selected}
                onHover={() => setSelected(index)}
                onNavigate={onClose}
              />
            ))}
          </Results>
        )}
      </Panel>
    </Root>,
    document.body,
  );
}
