'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { COMMON_BASES, convertBase } from '@/lib/number-base';

const Input = styled('input')(({ theme }) => ({
  flex: '1 1 12rem',
  padding: '0.6rem 0.8rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const Row = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '6rem 1fr',
  gap: theme.space(2),
  alignItems: 'baseline',
  padding: `${theme.space(2)} 0`,
  borderTop: `1px solid ${theme.color.border}`,
}));

const Value = styled('code')(({ theme }) => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.95rem',
  wordBreak: 'break-all',
  color: theme.color.text,
}));

const BASE_LABELS: Record<number, string> = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hex' };

export default function NumberBaseConverter() {
  const [value, setValue] = useState('255');
  const [fromBase, setFromBase] = useState(10);

  const { outputs, error } = useMemo(() => {
    if (!value.trim()) return { outputs: null, error: '' };
    try {
      const outputs = COMMON_BASES.map((base) => ({
        base,
        text: convertBase(value, fromBase, base),
      }));
      return { outputs, error: '' };
    } catch (e) {
      return { outputs: null, error: e instanceof Error ? e.message : 'Invalid input.' };
    }
  }, [value, fromBase]);

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={3} wrap align="center">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter a number…"
          aria-label="Number to convert"
          data-testid="base-input"
        />
        <label>
          <Text as="span" tone="muted" size="sm" weight={600}>
            Input base{' '}
          </Text>
          <select
            value={fromBase}
            onChange={(event) => setFromBase(Number(event.target.value))}
            data-testid="base-from"
          >
            {COMMON_BASES.map((base) => (
              <option key={base} value={base}>
                {BASE_LABELS[base]} ({base})
              </option>
            ))}
          </select>
        </label>
      </Stack>

      {error ? (
        <Text tone="danger" size="sm" data-testid="base-error">
          {error}
        </Text>
      ) : outputs ? (
        <div>
          {outputs.map(({ base, text }) => (
            <Row key={base}>
              <Text as="span" tone="muted" size="sm" weight={700}>
                {BASE_LABELS[base]}
              </Text>
              <Value data-testid={`base-out-${base}`}>{text}</Value>
            </Row>
          ))}
        </div>
      ) : null}
    </Stack>
  );
}
