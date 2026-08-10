'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { alignDiffLines, diffLines, diffStats, type DiffType } from '@toolkit/lib/diff';

type ViewMode = 'unified' | 'side-by-side';

const Inputs = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
  gap: theme.space(2),
  alignItems: 'start',
  '@media (max-width: 640px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
}));

const InputField = styled('label')(({ theme }) => ({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  gap: theme.space(1),
  color: theme.color.muted,
  fontSize: '0.8rem',
  fontWeight: 700,
}));

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '9rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

const SwapButton = styled('button')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'auto',
  minWidth: '3.5rem',
  height: '2.25rem',
  marginTop: '1.45rem',
  padding: '0.1rem 0.75rem 0',
  fontSize: '0.78rem',
  fontWeight: 700,
  lineHeight: 1,
  color: theme.color.muted,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.pill,
  transition: 'color 0.15s ease, border-color 0.15s ease, background 0.15s ease',
  '&:hover': {
    color: theme.color.text,
    borderColor: theme.color.accent,
    background: theme.color.surface2,
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
  },
  '@media (max-width: 640px)': {
    margin: '-0.15rem auto',
    transform: 'rotate(90deg)',
  },
}));

const Toolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(2),
}));

const ViewSwitch = styled('div')(({ theme }) => ({
  display: 'inline-flex',
  padding: '0.2rem',
  background: theme.color.surface2,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.pill,
}));

const ViewButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
  padding: '0.35rem 0.75rem',
  color: active ? theme.color.accentContrast : theme.color.muted,
  background: active ? theme.color.accent : 'transparent',
  border: 0,
  borderRadius: theme.radius.pill,
  fontSize: '0.8rem',
  fontWeight: 700,
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
  },
}));

const Result = styled('div')(({ theme }) => ({
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  overflow: 'hidden',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
}));

const Line = styled('div', {
  shouldForwardProp: (prop) => prop !== 'kind',
})<{ kind: DiffType }>(({ theme, kind }) => ({
  display: 'flex',
  gap: theme.space(2),
  minWidth: 0,
  padding: '0.15rem 0.6rem',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  color: theme.color.text,
  background:
    kind === 'add'
      ? `color-mix(in srgb, ${theme.color.accent} 18%, transparent)`
      : kind === 'del'
        ? theme.color.dangerBg
        : 'transparent',
}));

const Sign = styled('span')(({ theme }) => ({
  flex: '0 0 auto',
  color: theme.color.muted,
  userSelect: 'none',
}));

const SideHeader = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  color: theme.color.muted,
  background: theme.color.surface2,
  borderBottom: `1px solid ${theme.color.border}`,
  fontFamily: 'inherit',
  fontSize: '0.75rem',
  fontWeight: 700,
  '& > span': { padding: '0.45rem 0.7rem' },
  '& > span + span': { borderLeft: `1px solid ${theme.color.border}` },
  '@media (max-width: 640px)': { display: 'none' },
}));

const SideRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  borderBottom: `1px solid ${theme.color.border}`,
  '&:last-child': { borderBottom: 0 },
  '@media (max-width: 640px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
    padding: '0.25rem 0',
  },
}));

const SideCell = styled('div', {
  shouldForwardProp: (prop) => prop !== 'kind',
})<{ kind: DiffType | 'empty' }>(({ theme, kind }) => ({
  display: 'grid',
  gridTemplateColumns: '2.25rem minmax(0, 1fr)',
  minWidth: 0,
  minHeight: '1.75rem',
  padding: '0.2rem 0.55rem 0.2rem 0',
  color: theme.color.text,
  background:
    kind === 'add'
      ? `color-mix(in srgb, ${theme.color.accent} 18%, transparent)`
      : kind === 'del'
        ? theme.color.dangerBg
        : kind === 'empty'
          ? theme.color.surface2
          : 'transparent',
  '& + &': { borderLeft: `1px solid ${theme.color.border}` },
  '& code': {
    minWidth: 0,
    font: 'inherit',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  '@media (max-width: 640px)': {
    '& + &': { borderLeft: 0, borderTop: `1px dashed ${theme.color.border}` },
    '&::before': {
      content: 'attr(data-label)',
      gridColumn: '1 / -1',
      paddingLeft: '0.55rem',
      color: theme.color.muted,
      fontFamily: 'inherit',
      fontSize: '0.68rem',
      fontWeight: 700,
      textTransform: 'uppercase',
    },
    '&[data-empty="true"]': { display: 'none' },
  },
}));

const LineNumber = styled('span')(({ theme }) => ({
  paddingRight: '0.55rem',
  color: theme.color.subtle,
  textAlign: 'right',
  userSelect: 'none',
}));

const SIGN = { same: ' ', add: '+', del: '-' } as const;

export default function TextDiff() {
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [view, setView] = useState<ViewMode>('unified');

  const lines = useMemo(() => diffLines(before, after), [before, after]);
  const stats = useMemo(() => diffStats(lines), [lines]);
  const sideRows = useMemo(() => {
    let beforeLine = 0;
    let afterLine = 0;
    return alignDiffLines(lines).map((row) => ({
      ...row,
      beforeLine: row.before ? ++beforeLine : null,
      afterLine: row.after ? ++afterLine : null,
    }));
  }, [lines]);
  const hasInput = before !== '' || after !== '';

  const swapSides = () => {
    setBefore(after);
    setAfter(before);
  };

  return (
    <Stack gap={3}>
      <Inputs>
        <InputField>
          Original
          <Area
            value={before}
            onChange={(event) => setBefore(event.target.value)}
            placeholder="Original text…"
            aria-label="Original text"
            data-testid="diff-before"
          />
        </InputField>
        <SwapButton
          type="button"
          onClick={swapSides}
          aria-label="Swap original and changed text"
          title="Swap sides"
          data-testid="diff-swap"
        >
          Swap
        </SwapButton>
        <InputField>
          Changed
          <Area
            value={after}
            onChange={(event) => setAfter(event.target.value)}
            placeholder="Changed text…"
            aria-label="Changed text"
            data-testid="diff-after"
          />
        </InputField>
      </Inputs>

      {hasInput ? (
        <>
          <Toolbar>
            <Text tone="muted" size="sm" data-testid="diff-stats">
              +{stats.added} added, −{stats.removed} removed, {stats.unchanged} unchanged
            </Text>
            <ViewSwitch role="group" aria-label="Diff view">
              <ViewButton
                type="button"
                active={view === 'unified'}
                aria-pressed={view === 'unified'}
                onClick={() => setView('unified')}
                data-testid="diff-view-unified"
              >
                Unified
              </ViewButton>
              <ViewButton
                type="button"
                active={view === 'side-by-side'}
                aria-pressed={view === 'side-by-side'}
                onClick={() => setView('side-by-side')}
                data-testid="diff-view-side"
              >
                Side by side
              </ViewButton>
            </ViewSwitch>
          </Toolbar>

          {view === 'unified' ? (
            <Result data-testid="diff-result">
              {lines.map((line, index) => (
                <Line key={index} kind={line.type}>
                  <Sign>{SIGN[line.type]}</Sign>
                  <span>{line.text}</span>
                </Line>
              ))}
            </Result>
          ) : (
            <Result data-testid="diff-side-result">
              <SideHeader aria-hidden>
                <span>Original</span>
                <span>Changed</span>
              </SideHeader>
              {sideRows.map((row, index) => (
                <SideRow key={index} data-testid="diff-side-row">
                  <SideCell
                    kind={row.before?.type ?? 'empty'}
                    data-label="Original"
                    data-empty={row.before === null ? 'true' : undefined}
                  >
                    <LineNumber aria-hidden>{row.beforeLine ?? ''}</LineNumber>
                    <code>{row.before?.text ?? ''}</code>
                  </SideCell>
                  <SideCell
                    kind={row.after?.type ?? 'empty'}
                    data-label="Changed"
                    data-empty={row.after === null ? 'true' : undefined}
                  >
                    <LineNumber aria-hidden>{row.afterLine ?? ''}</LineNumber>
                    <code>{row.after?.text ?? ''}</code>
                  </SideCell>
                </SideRow>
              ))}
            </Result>
          )}
        </>
      ) : null}
    </Stack>
  );
}
