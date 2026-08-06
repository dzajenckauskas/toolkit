'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { HASH_ALGORITHMS, type HashAlgorithm, hashText } from '@toolkit/lib/hash';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '7rem',
  padding: theme.space(3),
  fontSize: '0.95rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

const Row = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(5rem, auto) minmax(0, 1fr)',
  gap: theme.space(2),
  alignItems: 'baseline',
  padding: `${theme.space(2)} 0`,
  borderTop: `1px solid ${theme.color.border}`,
}));

const Digest = styled('code')(({ theme }) => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
  wordBreak: 'break-all',
  color: theme.color.text,
}));

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>({
    'SHA-1': '',
    'SHA-256': '',
    'SHA-384': '',
    'SHA-512': '',
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all(HASH_ALGORITHMS.map((algo) => hashText(input, algo))).then((results) => {
      if (cancelled) return;
      const next = {} as Record<HashAlgorithm, string>;
      HASH_ALGORITHMS.forEach((algo, i) => {
        next[algo] = results[i]!;
      });
      setHashes(next);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <Stack gap={3}>
      <Area
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Text to hash…"
        aria-label="Text to hash"
        data-testid="hash-input"
      />
      <div>
        {HASH_ALGORITHMS.map((algo) => (
          <Row key={algo}>
            <Text as="span" tone="muted" size="sm" weight={700}>
              {algo}
            </Text>
            <Digest data-testid={`hash-${algo.toLowerCase()}`}>{hashes[algo]}</Digest>
          </Row>
        ))}
      </div>
      <Text tone="muted" size="sm">
        Hashed in your browser with Web Crypto. MD5 is intentionally omitted.
      </Text>
    </Stack>
  );
}
