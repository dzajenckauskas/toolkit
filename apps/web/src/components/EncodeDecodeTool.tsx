'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@/components/ui';

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

interface Props {
  encode: (text: string) => string;
  /** Return null to signal invalid input. */
  decode: (text: string) => string | null;
  decodeError: string;
  encodePlaceholder: string;
  decodePlaceholder: string;
  testIdPrefix: string;
}

/** Shared encode/decode UI: a mode toggle, an input, and a read-only output. */
export default function EncodeDecodeTool({
  encode,
  decode,
  decodeError,
  encodePlaceholder,
  decodePlaceholder,
  testIdPrefix,
}: Props) {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' };
    if (mode === 'encode') return { output: encode(input), error: '' };
    const decoded = decode(input);
    return decoded === null ? { output: '', error: decodeError } : { output: decoded, error: '' };
  }, [mode, input, encode, decode, decodeError]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
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
          data-testid={`${testIdPrefix}-mode-encode`}
        >
          Encode
        </Button>
        <Button
          type="button"
          variant={mode === 'decode' ? 'primary' : 'ghost'}
          onClick={() => switchMode('decode')}
          data-testid={`${testIdPrefix}-mode-decode`}
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
        placeholder={mode === 'encode' ? encodePlaceholder : decodePlaceholder}
        aria-label={mode === 'encode' ? 'Text to encode' : 'Text to decode'}
        data-testid={`${testIdPrefix}-input`}
      />

      {error ? (
        <Text tone="danger" size="sm" data-testid={`${testIdPrefix}-error`}>
          {error}
        </Text>
      ) : null}

      <Stack direction="row" gap={2} align="center" wrap>
        <Text as="span" tone="muted" size="sm" weight={600}>
          Output
        </Text>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void copy()}
          data-testid={`${testIdPrefix}-copy`}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Stack>

      <Area readOnly value={output} aria-label="Result" data-testid={`${testIdPrefix}-output`} />
    </Stack>
  );
}
