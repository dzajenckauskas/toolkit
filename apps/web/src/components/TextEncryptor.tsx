'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { decryptText, encryptText } from '@/lib/crypto-text';

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

const Input = styled('input')(({ theme }) => ({
  width: '100%',
  maxWidth: '20rem',
  padding: '0.6rem 0.8rem',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

type Mode = 'encrypt' | 'decrypt';

export default function TextEncryptor() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setError('');
    setCopied(false);
    if (!input || !password) {
      setError('Enter both a message and a password.');
      return;
    }
    setBusy(true);
    try {
      setOutput(
        mode === 'encrypt'
          ? await encryptText(input, password)
          : await decryptText(input, password),
      );
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap>
        <Button
          type="button"
          variant={mode === 'encrypt' ? 'primary' : 'ghost'}
          onClick={() => switchMode('encrypt')}
          data-testid="encrypt-mode-encrypt"
        >
          Encrypt
        </Button>
        <Button
          type="button"
          variant={mode === 'decrypt' ? 'primary' : 'ghost'}
          onClick={() => switchMode('decrypt')}
          data-testid="encrypt-mode-decrypt"
        >
          Decrypt
        </Button>
      </Stack>

      <Area
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={mode === 'encrypt' ? 'Message to encrypt…' : 'Encrypted message (base64)…'}
        aria-label={mode === 'encrypt' ? 'Message to encrypt' : 'Message to decrypt'}
        data-testid="encrypt-input"
      />

      <Input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        aria-label="Password"
        data-testid="encrypt-password"
      />

      <Stack direction="row" gap={2} align="center" wrap>
        <Button
          type="button"
          variant="primary"
          onClick={() => void run()}
          disabled={busy}
          data-testid="encrypt-run"
        >
          {busy ? 'Working…' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </Button>
        {output ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => void copy()}
            data-testid="encrypt-copy"
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        ) : null}
      </Stack>

      {error ? (
        <Text tone="danger" size="sm" data-testid="encrypt-error">
          {error}
        </Text>
      ) : null}

      {output ? (
        <Area readOnly value={output} aria-label="Result" data-testid="encrypt-output" />
      ) : null}

      <Text tone="muted" size="sm">
        AES-256-GCM with a PBKDF2 key from your password. Encrypted in your browser — the password
        is never stored or sent. Lose the password and the message is unrecoverable.
      </Text>
    </Stack>
  );
}
