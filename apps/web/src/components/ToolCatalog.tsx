'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { Stack, Text } from '@/components/ui';
import {
  CATEGORY_ORDER,
  searchTools,
  toolsByCategory,
  type Tool,
  type ToolCategory,
} from '@/tools/registry';
import { CategoryIcon } from '@/components/CategoryIcon';

const SearchWrap = styled('div')({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

const SearchIcon = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: '1rem',
  display: 'flex',
  color: theme.color.muted,
  pointerEvents: 'none',
}));

const SearchInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.8rem 4rem 0.8rem 2.9rem',
  fontSize: '1.05rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

const Kbd = styled('kbd')(({ theme }) => ({
  position: 'absolute',
  right: '0.9rem',
  fontFamily: 'inherit',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  color: theme.color.muted,
  border: `1px solid ${theme.color.border}`,
  borderRadius: '6px',
  padding: '0.1rem 0.4rem',
  pointerEvents: 'none',
}));

const CategoryHeading = styled('h2')(({ theme }) => ({
  margin: `0 0 ${theme.space(3)}`,
  fontSize: '0.85rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.color.muted,
}));

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: theme.space(3),
}));

const cardStyles = (theme: import('@/theme/theme').AppTheme) => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: theme.space(1),
  padding: theme.space(4),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
});

const CardLink = styled(Link)(({ theme }) => ({
  ...cardStyles(theme),
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
  '&:hover': { borderColor: theme.color.accent },
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

const CardStatic = styled('div')(({ theme }) => ({
  ...cardStyles(theme),
  opacity: 0.55,
}));

const TitleRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
});

const Soon = styled('span')(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  color: theme.color.muted,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.pill,
  padding: '0.1rem 0.5rem',
}));

// --- Command-palette results list ---

const ResultsList = styled('div')(({ theme }) => ({
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  overflow: 'hidden',
}));

const SectionLabel = styled('div')(({ theme }) => ({
  padding: `${theme.space(2)} ${theme.space(3)} ${theme.space(1)}`,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.color.muted,
}));

const rowStyles = (theme: import('@/theme/theme').AppTheme, selected: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(3),
  padding: `${theme.space(2)} ${theme.space(3)}`,
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

const RowText = styled('div')({
  flex: '1 1 auto',
  minWidth: 0,
});

const RowName = styled('div')(({ theme }) => ({
  fontWeight: 600,
  color: theme.color.text,
}));

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

const Chips = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(2),
}));

const Chip = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.space(2),
  padding: '0.4rem 0.8rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  color: active ? theme.color.accentContrast : theme.color.text,
  background: active ? theme.color.accent : theme.color.surface,
  border: `1px solid ${active ? theme.color.accent : theme.color.border}`,
  borderRadius: theme.radius.pill,
  transition: 'border-color 0.12s ease, background 0.12s ease',
  '& svg': { color: active ? theme.color.accentContrast : theme.color.muted },
  '&:hover': { borderColor: theme.color.accent },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
  },
}));

const ChipCount = styled('span', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
  fontSize: '0.72rem',
  fontWeight: 700,
  opacity: 0.8,
  color: active ? theme.color.accentContrast : theme.color.muted,
}));

const CatSection = styled('section')({
  scrollMarginTop: '5rem', // clear the sticky header when jumped to via anchor
});

function ToolCard({ tool }: { tool: Tool }) {
  const body = (
    <>
      <TitleRow>
        <Text as="span" weight={600}>
          {tool.name}
        </Text>
        {tool.status === 'planned' ? <Soon>Soon</Soon> : null}
      </TitleRow>
      <Text tone="muted" size="sm">
        {tool.description}
      </Text>
    </>
  );

  if (tool.status === 'live') {
    return (
      <CardLink href={tool.href} data-testid={`tool-${tool.id}`}>
        {body}
      </CardLink>
    );
  }
  return (
    <CardStatic aria-disabled="true" data-testid={`tool-${tool.id}`}>
      {body}
    </CardStatic>
  );
}

function ResultRow({
  tool,
  selected,
  onHover,
}: {
  tool: Tool;
  selected: boolean;
  onHover: () => void;
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
        data-testid={`tool-${tool.id}`}
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
      data-testid={`tool-${tool.id}`}
    >
      {inner}
    </RowStatic>
  );
}

export function ToolCatalog() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchTools(query), [query]);
  const searching = query.trim() !== '';
  const categoryGroups = useMemo(() => toolsByCategory(), []);

  // Keep the selection in range as results change.
  useEffect(() => {
    setSelected(0);
  }, [query]);

  const onInputKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!searching || results.length === 0) return;
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
        }
      } else if (event.key === 'Escape') {
        setQuery('');
      }
    },
    [searching, results, selected, router],
  );

  const groups = CATEGORY_ORDER.map((category) => ({
    category: category as ToolCategory,
    tools: results.filter((tool) => tool.category === category),
  }))
    .filter((group) => group.tools.length > 0)
    .filter((group) => activeCategory === null || group.category === activeCategory);

  return (
    <Stack gap={5}>
      <SearchWrap>
        <SearchIcon aria-hidden>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
        </SearchIcon>
        <SearchInput
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Search tools and actions…"
          aria-label="Search tools and actions"
          role="combobox"
          aria-expanded={searching}
          aria-controls="tool-results"
          data-testid="tool-search"
        />
        <Kbd aria-hidden>⌘K</Kbd>
      </SearchWrap>

      {!searching ? (
        <Chips role="group" aria-label="Browse by category" data-testid="category-chips">
          <Chip
            type="button"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            data-testid="chip-all"
          >
            All
            <ChipCount active={activeCategory === null}>
              {categoryGroups.reduce((n, g) => n + g.tools.length, 0)}
            </ChipCount>
          </Chip>
          {categoryGroups.map((group) => (
            <Chip
              key={group.category}
              type="button"
              active={activeCategory === group.category}
              onClick={() =>
                setActiveCategory((cur) => (cur === group.category ? null : group.category))
              }
              data-testid={`chip-${group.category}`}
            >
              <CategoryIcon category={group.category} />
              {group.category}
              <ChipCount active={activeCategory === group.category}>{group.tools.length}</ChipCount>
            </Chip>
          ))}
        </Chips>
      ) : null}

      {searching ? (
        results.length === 0 ? (
          <Text tone="muted" data-testid="tool-empty">
            No tools match “{query}”.
          </Text>
        ) : (
          <ResultsList id="tool-results" role="listbox" aria-label="Search results">
            <SectionLabel>Tools and actions</SectionLabel>
            {results.map((tool, index) => (
              <ResultRow
                key={tool.id}
                tool={tool}
                selected={index === selected}
                onHover={() => setSelected(index)}
              />
            ))}
          </ResultsList>
        )
      ) : (
        groups.map((group) => (
          <CatSection
            key={group.category}
            id={`cat-${group.category}`}
            data-testid={`cat-${group.category}`}
          >
            <CategoryHeading>{group.category}</CategoryHeading>
            <Grid>
              {group.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </Grid>
          </CatSection>
        ))
      )}
    </Stack>
  );
}
