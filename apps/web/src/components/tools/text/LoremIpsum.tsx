'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { MAX_PARAGRAPHS, generateParagraphs } from '@toolkit/lib/lorem';

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
  borderRadius: theme.radius.md,
}));

const Output = styled('textarea')(({ theme }) => ({
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

export default function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback((n: number) => {
    setText(generateParagraphs(n).join('\n\n'));
    setCopied(false);
  }, []);

  useEffect(() => {
    generate(3);
  }, [generate]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // clipboard unavailable; the textarea stays selectable
    }
  };

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={3} align="center" wrap>
        <Field>
          Paragraphs
          <NumberInput
            type="number"
            min={1}
            max={MAX_PARAGRAPHS}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            data-testid="lorem-count"
          />
        </Field>
        <Button
          type="button"
          variant="primary"
          onClick={() => generate(count)}
          data-testid="lorem-generate"
        >
          Generate
        </Button>
        <Button type="button" variant="ghost" onClick={() => void copy()} data-testid="lorem-copy">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Stack>

      <Output readOnly value={text} aria-label="Lorem Ipsum text" data-testid="lorem-output" />

      <Text tone="muted" size="sm">
        Placeholder text generated in your browser. Up to {MAX_PARAGRAPHS} paragraphs.
      </Text>
    </Stack>
  );
}
