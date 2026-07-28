'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { type Tool } from '@/tools/registry';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { AppTheme } from '@toolkit/ui';

/**
 * The tool-palette results list. Shared verbatim by the inline catalog search
 * and the header search dialog so a result row looks and behaves identically
 * everywhere. The only per-context differences are cosmetic props (`bordered`,
 * an optional section label) and the test-id prefix.
 */

const Container = styled('div', {
  shouldForwardProp: (prop) => prop !== 'bordered',
})<{ bordered?: boolean }>(({ theme, bordered }) =>
  bordered
    ? {
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.md,
        background: theme.color.surface,
        overflow: 'hidden',
      }
    : {},
);

const SectionLabel = styled('div')(({ theme }) => ({
  padding: `${theme.space(2)} ${theme.space(3)} ${theme.space(1)}`,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.color.muted,
}));

const Empty = styled('div')(({ theme }) => ({
  padding: `${theme.space(4)} ${theme.space(3)}`,
  color: theme.color.muted,
}));

const rowStyles = (theme: AppTheme, selected: boolean) => ({
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

function Row({
  tool,
  selected,
  testId,
  onHover,
  onNavigate,
}: {
  tool: Tool;
  selected: boolean;
  testId: string;
  onHover: () => void;
  onNavigate?: () => void;
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
        data-testid={testId}
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
      data-testid={testId}
    >
      {inner}
    </RowStatic>
  );
}

export interface ToolResultsProps {
  results: Tool[];
  selected: number;
  onHover: (index: number) => void;
  /** Fired when a live row is clicked (e.g. to close the dialog). */
  onNavigate?: () => void;
  query: string;
  /** Row test id becomes `${testIdPrefix}-${tool.id}`. */
  testIdPrefix: string;
  emptyTestId: string;
  listId?: string;
  sectionLabel?: string;
  bordered?: boolean;
  className?: string;
}

export function ToolResults({
  results,
  selected,
  onHover,
  onNavigate,
  query,
  testIdPrefix,
  emptyTestId,
  listId,
  sectionLabel,
  bordered,
  className,
}: ToolResultsProps) {
  if (results.length === 0) {
    return <Empty data-testid={emptyTestId}>No tools match “{query}”.</Empty>;
  }

  return (
    <Container
      bordered={bordered}
      id={listId}
      role="listbox"
      aria-label="Search results"
      className={className}
    >
      {sectionLabel ? <SectionLabel>{sectionLabel}</SectionLabel> : null}
      {results.map((tool, index) => (
        <Row
          key={tool.id}
          tool={tool}
          selected={index === selected}
          testId={`${testIdPrefix}-${tool.id}`}
          onHover={() => onHover(index)}
          onNavigate={onNavigate}
        />
      ))}
    </Container>
  );
}
