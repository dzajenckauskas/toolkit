'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, CodeTextArea as Area, Stack, Text } from '@toolkit/ui';
import { encodeJwt, JWT_ALGORITHMS, type JwtAlgorithm } from '@toolkit/lib/jwt';

const DEFAULT_HEADER = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';
const DEFAULT_PAYLOAD = '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}';
const DEFAULT_SECRET = 'your-256-bit-secret';

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(1),
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

const Row = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(3),
  '& > *': { flex: '1 1 12rem' },
}));

const TextInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
}));

const Select = styled('select')(({ theme }) => ({
  width: '100%',
  padding: theme.space(3),
  fontSize: '0.9rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
}));

function parseJsonObject(text: string, label: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(`The ${label} is not valid JSON.`);
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`The ${label} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

export default function JwtGenerator() {
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState(DEFAULT_SECRET);
  const [alg, setAlg] = useState<JwtAlgorithm>('HS256');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Re-sign whenever an input changes. Signing is async (Web Crypto), so guard
  // against an out-of-order resolve with a cancelled flag.
  useEffect(() => {
    let cancelled = false;
    setCopied(false);

    let headerObj: Record<string, unknown>;
    let payloadObj: Record<string, unknown>;
    try {
      headerObj = parseJsonObject(header, 'header');
      payloadObj = parseJsonObject(payload, 'payload');
    } catch (caught) {
      setToken('');
      setError(caught instanceof Error ? caught.message : 'Invalid input.');
      return;
    }

    setError('');
    void encodeJwt(headerObj, payloadObj, secret, alg)
      .then((next) => {
        if (!cancelled) setToken(next);
      })
      .catch(() => {
        if (!cancelled) {
          setToken('');
          setError('Could not sign the token in your browser.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [header, payload, secret, alg]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      // clipboard unavailable; the token stays selectable
    }
  };

  const download = () => {
    const blob = new Blob([token], { type: 'application/jwt' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'token.jwt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Stack gap={3}>
      <Row>
        <Field>
          Algorithm
          <Select
            value={alg}
            onChange={(event) => setAlg(event.target.value as JwtAlgorithm)}
            data-testid="jwt-gen-alg"
          >
            {JWT_ALGORITHMS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          Secret
          <TextInput
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            placeholder="HMAC secret"
            aria-label="HMAC secret"
            data-testid="jwt-gen-secret"
          />
        </Field>
      </Row>

      <Field>
        Header
        <Area
          value={header}
          onChange={(event) => setHeader(event.target.value)}
          aria-label="JWT header JSON"
          data-testid="jwt-gen-header"
        />
      </Field>

      <Field>
        Payload
        <Area
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          aria-label="JWT payload JSON"
          data-testid="jwt-gen-payload"
        />
      </Field>

      {error ? (
        <Text tone="danger" size="sm" data-testid="jwt-gen-error">
          {error}
        </Text>
      ) : null}

      <Stack direction="row" gap={2} align="center" wrap>
        <Text as="span" tone="muted" size="sm" weight={600}>
          Token
        </Text>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void copy()}
          disabled={!token}
          data-testid="jwt-gen-copy"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={download}
          disabled={!token}
          data-testid="jwt-gen-download"
        >
          Download
        </Button>
      </Stack>

      <Area readOnly value={token} aria-label="Signed JWT" data-testid="jwt-gen-token" />

      <Text tone="muted" size="sm">
        Signed in your browser with HMAC — the secret never leaves your device. The header’s{' '}
        <code>alg</code> is set to match the algorithm you pick.
      </Text>
    </Stack>
  );
}
