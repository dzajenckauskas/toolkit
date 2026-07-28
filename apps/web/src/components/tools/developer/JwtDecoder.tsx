'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { decodeJwt } from '@toolkit/lib/jwt';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '7rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
  wordBreak: 'break-all',
}));

const Pre = styled('pre')(({ theme }) => ({
  margin: 0,
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  overflowX: 'auto',
}));

export default function JwtDecoder() {
  const [token, setToken] = useState('');

  const result = useMemo(() => {
    if (!token.trim()) return null;
    try {
      const { header, payload } = decodeJwt(token);
      return { ok: true as const, header, payload };
    } catch (error) {
      return { ok: false as const, error: error instanceof Error ? error.message : 'Invalid JWT' };
    }
  }, [token]);

  return (
    <Stack gap={3}>
      <Area
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="Paste a JWT (header.payload.signature)…"
        aria-label="JWT"
        data-testid="jwt-input"
      />

      {result?.ok ? (
        <Stack gap={3}>
          <div>
            <Text as="span" tone="muted" size="sm" weight={700}>
              Header
            </Text>
            <Pre data-testid="jwt-header">{JSON.stringify(result.header, null, 2)}</Pre>
          </div>
          <div>
            <Text as="span" tone="muted" size="sm" weight={700}>
              Payload
            </Text>
            <Pre data-testid="jwt-payload">{JSON.stringify(result.payload, null, 2)}</Pre>
          </div>
        </Stack>
      ) : null}

      {result && !result.ok ? (
        <Text tone="danger" size="sm" data-testid="jwt-error">
          {result.error}
        </Text>
      ) : null}

      <Text tone="muted" size="sm">
        Decoded in your browser. The signature is not verified — that needs the key.
      </Text>
    </Stack>
  );
}
