'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import {
  DEFAULT_PASSWORD_OPTIONS,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  generatePassword,
  type PasswordOptions,
} from '@toolkit/lib/password';

const Output = styled('input')(({ theme }) => ({
  width: '100%',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1.1rem',
  letterSpacing: '0.02em',
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

const Range = styled('input')({ accentColor: 'currentColor' });

const OPTION_LABELS: { key: keyof Omit<PasswordOptions, 'length'>; label: string }[] = [
  { key: 'lowercase', label: 'a-z' },
  { key: 'uppercase', label: 'A-Z' },
  { key: 'digits', label: '0-9' },
  { key: 'symbols', label: '!@#' },
];

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback((opts: PasswordOptions) => {
    setPassword(generatePassword(opts));
    setCopied(false);
  }, []);

  // Initial password on mount (client-only → no hydration mismatch).
  useEffect(() => {
    generate(DEFAULT_PASSWORD_OPTIONS);
  }, [generate]);

  const update = (patch: Partial<PasswordOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    generate(next);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      // clipboard unavailable; the field stays selectable
    }
  };

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={2} align="center" wrap>
        <Output
          readOnly
          value={password}
          aria-label="Generated password"
          data-testid="password-output"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => void copy()}
          data-testid="password-copy"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => generate(options)}
          data-testid="password-regenerate"
        >
          Regenerate
        </Button>
      </Stack>

      <Field>
        Length: {options.length}
        <Range
          type="range"
          min={MIN_PASSWORD_LENGTH}
          max={MAX_PASSWORD_LENGTH}
          value={options.length}
          onChange={(event) => update({ length: Number(event.target.value) })}
          aria-label="Password length"
          data-testid="password-length"
        />
      </Field>

      <Stack direction="row" gap={4} wrap>
        {OPTION_LABELS.map(({ key, label }) => (
          <Field key={key}>
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(event) => update({ [key]: event.target.checked })}
              data-testid={`password-${key}`}
            />
            {label}
          </Field>
        ))}
      </Stack>

      {password === '' ? (
        <Text tone="danger" size="sm" data-testid="password-empty">
          Enable at least one character set.
        </Text>
      ) : null}
    </Stack>
  );
}
