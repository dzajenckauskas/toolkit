'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { Stack, Text } from '@/components/ui';
import { CATEGORY_ORDER, searchTools, type Tool } from '@/tools/registry';

const SearchInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.7rem 1rem',
  fontSize: '1rem',
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
  const [query, setQuery] = useState('');
  const results = searchTools(query);
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    tools: results.filter((tool) => tool.category === category),
  })).filter((group) => group.tools.length > 0);

  return (
    <Stack gap={5}>
      <SearchInput
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search tools…"
        aria-label="Search tools"
        data-testid="tool-search"
      />

      {groups.length === 0 ? (
        <Text tone="muted" data-testid="tool-empty">
          No tools match “{query}”.
        </Text>
      ) : null}

      {groups.map((group) => (
        <section key={group.category} data-testid={`cat-${group.category}`}>
          <CategoryHeading>{group.category}</CategoryHeading>
          <Grid>
            {group.tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </Grid>
        </section>
      ))}
    </Stack>
  );
}
