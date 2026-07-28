'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import {
  dedupeLines,
  lineStats,
  removeEmptyLines,
  reverseLines,
  shuffleLines,
  sortLines,
  trimLines,
} from '@/lib/line-tools';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '11rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

export default function LineTools() {
  const [text, setText] = useState('');
  const stats = useMemo(() => lineStats(text), [text]);

  const run = (fn: (t: string) => string) => setText((current) => fn(current));

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap>
        <Button
          type="button"
          variant="ghost"
          onClick={() => run((t) => sortLines(t, 'asc'))}
          data-testid="line-sort-asc"
        >
          Sort A→Z
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => run((t) => sortLines(t, 'desc'))}
          data-testid="line-sort-desc"
        >
          Sort Z→A
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => run(dedupeLines)}
          data-testid="line-dedupe"
        >
          Remove duplicates
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => run(reverseLines)}
          data-testid="line-reverse"
        >
          Reverse
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => run(shuffleLines)}
          data-testid="line-shuffle"
        >
          Shuffle
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => run(trimLines)}
          data-testid="line-trim"
        >
          Trim
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => run(removeEmptyLines)}
          data-testid="line-remove-empty"
        >
          Remove empty
        </Button>
      </Stack>

      <Area
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="One item per line…"
        aria-label="Lines of text"
        data-testid="line-input"
      />

      <Text tone="muted" size="sm" numeric data-testid="line-stats">
        {stats.lines} lines · {stats.nonEmpty} non-empty · {stats.unique} unique
      </Text>
    </Stack>
  );
}
