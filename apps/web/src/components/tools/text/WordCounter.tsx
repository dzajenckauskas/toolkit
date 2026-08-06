'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { textStats } from '@toolkit/lib/text-stats';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '12rem',
  padding: theme.space(3),
  fontSize: '0.95rem',
  lineHeight: 1.6,
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

const Stats = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
  gap: theme.space(2),
}));

const Stat = styled('div')(({ theme }) => ({
  padding: theme.space(3),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  textAlign: 'center',
}));

const Big = styled('div')(({ theme }) => ({
  fontSize: '1.6rem',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  color: theme.color.text,
}));

function readingTime(minutes: number): string {
  if (minutes < 1) return `${Math.ceil(minutes * 60)}s`;
  return `${Math.round(minutes * 10) / 10} min`;
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const stats = useMemo(() => textStats(text), [text]);

  const cells: [string, string, string][] = [
    ['words', 'Words', String(stats.words)],
    ['characters', 'Characters', String(stats.characters)],
    ['characters-no-spaces', 'No spaces', String(stats.charactersNoSpaces)],
    ['sentences', 'Sentences', String(stats.sentences)],
    ['paragraphs', 'Paragraphs', String(stats.paragraphs)],
    ['reading', 'Reading time', readingTime(stats.readingTimeMinutes)],
  ];

  return (
    <Stack gap={4}>
      <Area
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type or paste your text…"
        aria-label="Text to analyse"
        data-testid="wc-input"
      />
      <Stats>
        {cells.map(([id, label, value]) => (
          <Stat key={id}>
            <Big data-testid={`wc-${id}`}>{value}</Big>
            <Text tone="muted" size="sm">
              {label}
            </Text>
          </Stat>
        ))}
      </Stats>
    </Stack>
  );
}
