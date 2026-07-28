'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { evaluateLines } from '@/lib/calc';

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  overflow: 'hidden',
}));

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '14rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.95rem',
  lineHeight: 1.6,
  color: theme.color.text,
  background: theme.color.surface,
  border: 'none',
  outline: 'none',
  resize: 'vertical',
}));

const Results = styled('div')(({ theme }) => ({
  minWidth: '7rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.95rem',
  lineHeight: 1.6,
  textAlign: 'right',
  borderLeft: `1px solid ${theme.color.border}`,
  background: theme.color.bg,
}));

const ResultLine = styled('div')<{ error?: boolean }>(({ theme, error }) => ({
  color: error ? theme.color.dangerText : theme.color.text,
  minHeight: '1.6em',
}));

const formatResult = (n: number): string =>
  Number.isInteger(n) ? String(n) : String(Math.round(n * 1e10) / 1e10);

export default function NotepadCalculator() {
  const [text, setText] = useState('2 + 2\n10 * (3 + 4)\n100 / 8');

  const lines = useMemo(() => evaluateLines(text), [text]);
  const total = useMemo(
    () => lines.reduce((sum, line) => (line.result !== null ? sum + line.result : sum), 0),
    [lines],
  );

  return (
    <Stack gap={3}>
      <Grid>
        <Area
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type calculations, one per line…"
          aria-label="Calculations"
          data-testid="calc-input"
          spellCheck={false}
        />
        <Results data-testid="calc-results">
          {lines.map((line, i) => (
            <ResultLine key={i} error={line.error}>
              {line.error ? 'error' : line.result !== null ? formatResult(line.result) : ' '}
            </ResultLine>
          ))}
        </Results>
      </Grid>
      <Text tone="muted" size="sm" data-testid="calc-total">
        Sum of all lines: {formatResult(total)}
      </Text>
    </Stack>
  );
}
