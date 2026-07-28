'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { formatJson, minifyJson } from '@/lib/json-format';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '12rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

type Action = 'format' | 'minify';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [action, setAction] = useState<Action>('format');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true as const, output: '' };
    return action === 'format' ? formatJson(input, 2) : minifyJson(input);
  }, [input, action]);

  const copy = async () => {
    if (!result.ok) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
    } catch {
      // clipboard unavailable; the textarea stays selectable
    }
  };

  const run = (next: Action) => {
    setAction(next);
    setCopied(false);
  };

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap>
        <Button
          type="button"
          variant={action === 'format' ? 'primary' : 'ghost'}
          onClick={() => run('format')}
          data-testid="json-format"
        >
          Format
        </Button>
        <Button
          type="button"
          variant={action === 'minify' ? 'primary' : 'ghost'}
          onClick={() => run('minify')}
          data-testid="json-minify"
        >
          Minify
        </Button>
      </Stack>

      <Area
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          setCopied(false);
        }}
        placeholder='{ "paste": "your JSON here" }'
        aria-label="JSON input"
        data-testid="json-input"
      />

      {result.ok ? (
        <>
          <Stack direction="row" gap={2} align="center" wrap>
            <Text as="span" tone="muted" size="sm" weight={600}>
              Output
            </Text>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void copy()}
              data-testid="json-copy"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Stack>
          <Area
            readOnly
            value={result.output}
            aria-label="Formatted JSON"
            data-testid="json-output"
          />
        </>
      ) : (
        <Text tone="danger" size="sm" data-testid="json-error">
          {result.error}
        </Text>
      )}
    </Stack>
  );
}
