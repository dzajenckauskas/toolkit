'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { DEFAULT_PERIOD, generateTotp, totpTimeRemaining } from '@toolkit/lib/totp';

const Input = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.6rem 0.8rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1rem',
  letterSpacing: '0.08em',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const Code = styled('div')(({ theme }) => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 'clamp(2.5rem, 10vw, 3.5rem)',
  fontWeight: 700,
  letterSpacing: '0.15em',
  color: theme.color.text,
}));

const Bar = styled('div')(({ theme }) => ({
  height: '6px',
  borderRadius: theme.radius.pill,
  background: theme.color.border,
  overflow: 'hidden',
}));

const Fill = styled('div')(({ theme }) => ({
  height: '100%',
  background: theme.color.accent,
  transition: 'width 1s linear',
}));

export default function TotpGenerator() {
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(DEFAULT_PERIOD);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (!secret.trim()) {
        setCode('');
        setError('');
        return;
      }
      try {
        const next = await generateTotp(secret);
        if (!cancelled) {
          setCode(next);
          setError('');
          setRemaining(totpTimeRemaining());
        }
      } catch (e) {
        if (!cancelled) {
          setCode('');
          setError(e instanceof Error ? e.message : 'Invalid secret.');
        }
      }
    };
    void tick();
    const id = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [secret]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Stack gap={3}>
      <Input
        value={secret}
        onChange={(event) => {
          setSecret(event.target.value);
          setCopied(false);
        }}
        placeholder="Base32 secret, e.g. JBSWY3DPEHPK3PXP"
        aria-label="TOTP secret (base32)"
        data-testid="totp-secret"
        spellCheck={false}
      />

      {error ? (
        <Text tone="danger" size="sm" data-testid="totp-error">
          {error}
        </Text>
      ) : null}

      {code ? (
        <Stack gap={2}>
          <Code data-testid="totp-code">
            {code.slice(0, 3)} {code.slice(3)}
          </Code>
          <Bar>
            <Fill style={{ width: `${(remaining / DEFAULT_PERIOD) * 100}%` }} />
          </Bar>
          <Stack direction="row" gap={2} align="center">
            <Text tone="muted" size="sm" numeric data-testid="totp-remaining">
              Refreshes in {remaining}s
            </Text>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void copy()}
              data-testid="totp-copy"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Stack>
        </Stack>
      ) : null}

      <Text tone="muted" size="sm">
        Standard TOTP (RFC 6238) — the same 6-digit codes as your authenticator app. Computed in
        your browser; the secret never leaves your device.
      </Text>
    </Stack>
  );
}
