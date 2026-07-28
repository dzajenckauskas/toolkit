'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { HASH_ALGORITHMS, type HashAlgorithm } from '@toolkit/lib/hash';
import { hmac } from '@toolkit/lib/hmac';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '6rem',
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
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.95rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const Digest = styled('code')(({ theme }) => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  wordBreak: 'break-all',
  color: theme.color.text,
}));

export default function HmacGenerator() {
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [digest, setDigest] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!secret) {
      setDigest('');
      return;
    }
    hmac(message, secret, algorithm).then((result) => {
      if (!cancelled) setDigest(result);
    });
    return () => {
      cancelled = true;
    };
  }, [message, secret, algorithm]);

  return (
    <Stack gap={3}>
      <Area
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Message…"
        aria-label="Message"
        data-testid="hmac-message"
      />
      <Input
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
        placeholder="Secret key"
        aria-label="Secret key"
        data-testid="hmac-key"
      />
      <label>
        <Text as="span" tone="muted" size="sm" weight={600}>
          Algorithm{' '}
        </Text>
        <select
          value={algorithm}
          onChange={(event) => setAlgorithm(event.target.value as HashAlgorithm)}
          data-testid="hmac-algo"
        >
          {HASH_ALGORITHMS.map((algo) => (
            <option key={algo} value={algo}>
              {algo}
            </option>
          ))}
        </select>
      </label>

      {secret ? (
        <div>
          <Text as="span" tone="muted" size="sm" weight={700}>
            HMAC-{algorithm}
          </Text>
          <div>
            <Digest data-testid="hmac-output">{digest}</Digest>
          </div>
        </div>
      ) : (
        <Text tone="muted" size="sm">
          Enter a secret key to compute the HMAC.
        </Text>
      )}

      <Text tone="muted" size="sm">
        Computed in your browser with Web Crypto. Nothing is uploaded.
      </Text>
    </Stack>
  );
}
