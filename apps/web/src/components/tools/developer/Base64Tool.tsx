'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { encodeBase64, tryDecodeBase64 } from '@toolkit/lib/base64';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '8rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' };
    if (mode === 'encode') return { output: encodeBase64(input), error: '' };
    const decoded = tryDecodeBase64(input);
    return decoded === null
      ? { output: '', error: 'That is not valid Base64.' }
      : { output: decoded, error: '' };
  }, [mode, input]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      // clipboard unavailable; output stays selectable
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setInput('');
    setCopied(false);
  };

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap>
        <Button
          type="button"
          variant={mode === 'encode' ? 'primary' : 'ghost'}
          onClick={() => switchMode('encode')}
          data-testid="base64-mode-encode"
        >
          Encode
        </Button>
        <Button
          type="button"
          variant={mode === 'decode' ? 'primary' : 'ghost'}
          onClick={() => switchMode('decode')}
          data-testid="base64-mode-decode"
        >
          Decode
        </Button>
      </Stack>

      <Area
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          setCopied(false);
        }}
        placeholder={mode === 'encode' ? 'Text to encode…' : 'Base64 to decode…'}
        aria-label={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
        data-testid="base64-input"
      />

      {error ? (
        <Text tone="danger" size="sm" data-testid="base64-error">
          {error}
        </Text>
      ) : null}

      <Stack direction="row" gap={2} align="center" wrap>
        <Text as="span" tone="muted" size="sm" weight={600}>
          Output
        </Text>
        <Button type="button" variant="ghost" onClick={() => void copy()} data-testid="base64-copy">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Stack>

      <Area readOnly value={output} aria-label="Result" data-testid="base64-output" />
    </Stack>
  );
}
