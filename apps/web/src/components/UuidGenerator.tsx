'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { MAX_UUIDS, generateUuids } from '@/lib/uuid';

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
  fontSize: '0.9rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

const NumberInput = styled('input')(({ theme }) => ({
  width: '5rem',
  padding: '0.4rem 0.6rem',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: '8px',
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

const Output = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '10rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = useCallback((n: number) => {
    setIds(generateUuids(n));
    setCopied(false);
  }, []);

  // Generate an initial batch on mount (client-only → no hydration mismatch).
  useEffect(() => {
    generate(5);
  }, [generate]);

  const text = ids.join('\n');

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard may be unavailable; the textarea is still selectable.
    }
  }, [text]);

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={3} wrap align="center">
        <Field>
          Count
          <NumberInput
            type="number"
            min={1}
            max={MAX_UUIDS}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            data-testid="uuid-count"
          />
        </Field>
        <Button
          type="button"
          variant="primary"
          onClick={() => generate(count)}
          data-testid="uuid-generate"
        >
          Generate
        </Button>
        <Button type="button" variant="ghost" onClick={() => void copy()} data-testid="uuid-copy">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Stack>

      <Output readOnly value={text} aria-label="Generated UUIDs" data-testid="uuid-output" />

      <Text tone="muted" size="sm">
        Version 4 UUIDs, generated in your browser. Up to {MAX_UUIDS} at a time.
      </Text>
    </Stack>
  );
}
