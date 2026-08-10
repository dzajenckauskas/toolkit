'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { CodeTextArea as Area, Stack, Text } from '@toolkit/ui';
import { runRegex } from '@toolkit/lib/regex';

const Input = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.6rem 0.8rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.95rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const FlagsInput = styled(Input)({ maxWidth: '8rem' });

const Match = styled('li')(({ theme }) => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
  color: theme.color.text,
  padding: `${theme.space(1)} 0`,
}));

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');

  const result = useMemo(() => runRegex(pattern, flags, text), [pattern, flags, text]);

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap align="center">
        <Input
          value={pattern}
          onChange={(event) => setPattern(event.target.value)}
          placeholder="pattern, e.g. \\d+"
          aria-label="Regular expression pattern"
          data-testid="regex-pattern"
        />
        <FlagsInput
          value={flags}
          onChange={(event) => setFlags(event.target.value)}
          placeholder="flags"
          aria-label="Flags"
          data-testid="regex-flags"
        />
      </Stack>

      <Area
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Test string…"
        aria-label="Test string"
        data-testid="regex-text"
      />

      {result.ok ? (
        <div data-testid="regex-results">
          <Text tone="muted" size="sm">
            {result.matches.length} match{result.matches.length === 1 ? '' : 'es'}
          </Text>
          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {result.matches.map((m, i) => (
              <Match key={i}>
                “{m.match}” at {m.index}
                {m.groups.length ? ` — groups: [${m.groups.join(', ')}]` : ''}
              </Match>
            ))}
          </ul>
        </div>
      ) : (
        <Text tone="danger" size="sm" data-testid="regex-error">
          {result.error}
        </Text>
      )}
    </Stack>
  );
}
