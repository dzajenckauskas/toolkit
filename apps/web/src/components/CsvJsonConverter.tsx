'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { csvToJson, jsonToCsv } from '@/lib/csv-json';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '10rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.88rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

type Direction = 'csv2json' | 'json2csv';

export default function CsvJsonConverter() {
  const [direction, setDirection] = useState<Direction>('csv2json');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      if (direction === 'csv2json') {
        return { output: JSON.stringify(csvToJson(input), null, 2), error: '' };
      }
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        return { output: '', error: 'Provide a JSON array of objects.' };
      }
      return { output: jsonToCsv(parsed as Record<string, unknown>[]), error: '' };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : 'Invalid input.' };
    }
  }, [direction, input]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  const switchDir = (next: Direction) => {
    setDirection(next);
    setInput('');
    setCopied(false);
  };

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap>
        <Button
          type="button"
          variant={direction === 'csv2json' ? 'primary' : 'ghost'}
          onClick={() => switchDir('csv2json')}
          data-testid="csv-mode-csv2json"
        >
          CSV → JSON
        </Button>
        <Button
          type="button"
          variant={direction === 'json2csv' ? 'primary' : 'ghost'}
          onClick={() => switchDir('json2csv')}
          data-testid="csv-mode-json2csv"
        >
          JSON → CSV
        </Button>
      </Stack>

      <Area
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          setCopied(false);
        }}
        placeholder={
          direction === 'csv2json'
            ? 'Paste CSV (with a header row)…'
            : 'Paste a JSON array of objects…'
        }
        aria-label="Input"
        data-testid="csv-input"
      />

      {error ? (
        <Text tone="danger" size="sm" data-testid="csv-error">
          {error}
        </Text>
      ) : (
        <>
          <Stack direction="row" gap={2} align="center" wrap>
            <Text as="span" tone="muted" size="sm" weight={600}>
              Output
            </Text>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void copy()}
              data-testid="csv-copy"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Stack>
          <Area readOnly value={output} aria-label="Result" data-testid="csv-output" />
        </>
      )}
    </Stack>
  );
}
