'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import {
  CATEGORY_ORDER,
  toolsByCategory,
  type Tool,
  type ToolCategory,
} from '@toolkit/tools/registry';
import { CategoryIcon } from '@/components/layout/CategoryIcon';
import { useToolSearch } from '@/components/search/useToolSearch';
import { ToolResults } from '@/components/search/ToolResults';

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
  // Beat the higher-specificity global input[type='search'] padding so the
  // placeholder and entered text always clear the absolutely positioned icon.
  '&&': { padding: '0.8rem 4rem 0.8rem 2.9rem' },
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
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
  gap: theme.space(3),
}));

const cardStyles = (theme: import('@toolkit/ui').AppTheme) => ({
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

export function ToolCatalog() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<ToolCategory | null>(null);

  const { query, setQuery, results, searching, selected, setSelected, onKeyDown } = useToolSearch({
    onSelect: (tool) => router.push(tool.href),
  });
  const categoryGroups = useMemo(() => toolsByCategory(), []);

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
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
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
        <ToolResults
          results={results}
          selected={selected}
          onHover={setSelected}
          query={query}
          testIdPrefix="tool"
          emptyTestId="tool-empty"
          listId="tool-results"
          sectionLabel="Tools and actions"
          bordered
        />
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
