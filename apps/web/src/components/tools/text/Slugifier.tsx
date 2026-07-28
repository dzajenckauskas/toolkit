'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { slugify } from '@toolkit/lib/slugify';

const Input = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.7rem 0.9rem',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const Output = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.7rem 0.9rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
}));

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
  fontSize: '0.9rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

export default function Slugifier() {
  const [text, setText] = useState('');
  const [underscore, setUnderscore] = useState(false);
  const [lower, setLower] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(
    () => slugify(text, { separator: underscore ? '_' : '-', lower }),
    [text, underscore, lower],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Stack gap={3}>
      <Input
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setCopied(false);
        }}
        placeholder="Title or phrase to slugify…"
        aria-label="Text to slugify"
        data-testid="slug-input"
      />

      <Stack direction="row" gap={4} wrap>
        <Field>
          <input
            type="checkbox"
            checked={underscore}
            onChange={(event) => setUnderscore(event.target.checked)}
            data-testid="slug-underscore"
          />
          Use underscores
        </Field>
        <Field>
          <input
            type="checkbox"
            checked={lower}
            onChange={(event) => setLower(event.target.checked)}
            data-testid="slug-lower"
          />
          Lowercase
        </Field>
      </Stack>

      <Stack direction="row" gap={2} align="center" wrap>
        <Output readOnly value={slug} aria-label="Slug" data-testid="slug-output" />
        <Button type="button" variant="ghost" onClick={() => void copy()} data-testid="slug-copy">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Stack>

      <Text tone="muted" size="sm">
        Diacritics are stripped and everything else becomes the separator. Runs in your browser.
      </Text>
    </Stack>
  );
}
