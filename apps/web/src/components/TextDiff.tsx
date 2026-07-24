'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@/components/ui';
import { diffLines, diffStats } from '@/lib/diff';

const Inputs = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: theme.space(3),
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

const Result = styled('div')(({ theme }) => ({
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  overflow: 'hidden',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
}));

const Line = styled('div')<{ kind: 'same' | 'add' | 'del' }>(({ theme, kind }) => ({
  display: 'flex',
  gap: theme.space(2),
  padding: '0.1rem 0.6rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: theme.color.text,
  background:
    kind === 'add'
      ? 'color-mix(in srgb, green 16%, transparent)'
      : kind === 'del'
        ? 'color-mix(in srgb, red 16%, transparent)'
        : 'transparent',
}));

const Sign = styled('span')(({ theme }) => ({
  color: theme.color.muted,
  userSelect: 'none',
}));

const SIGN = { same: ' ', add: '+', del: '-' } as const;

export default function TextDiff() {
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');

  const lines = useMemo(() => diffLines(before, after), [before, after]);
  const stats = useMemo(() => diffStats(lines), [lines]);
  const hasInput = before !== '' || after !== '';

  return (
    <Stack gap={3}>
      <Inputs>
        <Area
          value={before}
          onChange={(event) => setBefore(event.target.value)}
          placeholder="Original text…"
          aria-label="Original text"
          data-testid="diff-before"
        />
        <Area
          value={after}
          onChange={(event) => setAfter(event.target.value)}
          placeholder="Changed text…"
          aria-label="Changed text"
          data-testid="diff-after"
        />
      </Inputs>

      {hasInput ? (
        <>
          <Text tone="muted" size="sm" data-testid="diff-stats">
            +{stats.added} added, −{stats.removed} removed, {stats.unchanged} unchanged
          </Text>
          <Result data-testid="diff-result">
            {lines.map((line, i) => (
              <Line key={i} kind={line.type}>
                <Sign>{SIGN[line.type]}</Sign>
                <span>{line.text}</span>
              </Line>
            ))}
          </Result>
        </>
      ) : null}
    </Stack>
  );
}
