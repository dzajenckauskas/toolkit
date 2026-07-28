'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { CASE_LABELS, type CaseName, convertCase } from '@toolkit/lib/case-convert';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '9rem',
  padding: theme.space(3),
  fontSize: '0.95rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

const CASE_ORDER: CaseName[] = [
  'lower',
  'upper',
  'title',
  'sentence',
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
];

export default function CaseConverter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState<CaseName | null>(null);

  const apply = (target: CaseName) => {
    setText((current) => convertCase(current, target));
    setCopied(null);
  };

  const copy = async (target: CaseName) => {
    try {
      await navigator.clipboard.writeText(convertCase(text, target));
      setCopied(target);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Stack gap={3}>
      <Area
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setCopied(null);
        }}
        placeholder="Type or paste text…"
        aria-label="Text to transform"
        data-testid="case-input"
      />

      <Stack direction="row" gap={2} wrap>
        {CASE_ORDER.map((name) => (
          <Button
            key={name}
            type="button"
            variant="ghost"
            onClick={() => apply(name)}
            data-testid={`case-${name}`}
          >
            {CASE_LABELS[name]}
          </Button>
        ))}
      </Stack>

      <Stack direction="row" gap={2} wrap align="center">
        <Text as="span" tone="muted" size="sm">
          Tip: buttons transform the text in place. Copy a specific case:
        </Text>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void copy('camel')}
          data-testid="case-copy-camel"
        >
          {copied === 'camel' ? 'Copied camelCase' : 'Copy camelCase'}
        </Button>
      </Stack>
    </Stack>
  );
}
