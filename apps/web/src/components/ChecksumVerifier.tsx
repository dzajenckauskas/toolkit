'use client';

import { useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@/components/ui';
import { HASH_ALGORITHMS, type HashAlgorithm, checksumsMatch, hashBytes } from '@/lib/hash';

const Input = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.6rem 0.8rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const Digest = styled('code')(({ theme }) => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
  wordBreak: 'break-all',
  color: theme.color.text,
}));

export default function ChecksumVerifier() {
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [fileName, setFileName] = useState('');
  const [digest, setDigest] = useState('');
  const [expected, setExpected] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File, algo: HashAlgorithm) => {
      setBusy(true);
      setFileName(file.name);
      try {
        const buffer = await file.arrayBuffer();
        setDigest(await hashBytes(buffer, algo));
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const fileRef = useRef<File | null>(null);
  const onPick = (file: File) => {
    fileRef.current = file;
    void handleFile(file, algorithm);
  };

  const onAlgoChange = (algo: HashAlgorithm) => {
    setAlgorithm(algo);
    if (fileRef.current) void handleFile(fileRef.current, algo);
  };

  const match = digest && expected ? checksumsMatch(digest, expected) : null;

  return (
    <Stack gap={4}>
      <input
        ref={inputRef}
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
        }}
        aria-label="File to checksum"
        data-testid="checksum-file"
      />

      <label>
        <Text as="span" tone="muted" size="sm" weight={600}>
          Algorithm{' '}
        </Text>
        <select
          value={algorithm}
          onChange={(event) => onAlgoChange(event.target.value as HashAlgorithm)}
          data-testid="checksum-algo"
        >
          {HASH_ALGORITHMS.map((algo) => (
            <option key={algo} value={algo}>
              {algo}
            </option>
          ))}
        </select>
      </label>

      {fileName ? (
        <Stack gap={1}>
          <Text tone="muted" size="sm">
            {busy ? 'Hashing…' : fileName}
          </Text>
          <Digest data-testid="checksum-digest">{digest}</Digest>
        </Stack>
      ) : null}

      <label>
        <Text as="span" tone="muted" size="sm" weight={600}>
          Expected checksum (optional)
        </Text>
        <Input
          value={expected}
          onChange={(event) => setExpected(event.target.value)}
          placeholder="Paste a checksum to compare…"
          data-testid="checksum-expected"
        />
      </label>

      {match !== null ? (
        <Text tone={match ? 'default' : 'danger'} weight={700} data-testid="checksum-result">
          {match ? '✓ Checksums match' : '✗ Checksums do not match'}
        </Text>
      ) : null}

      <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()}>
        Choose a file
      </Button>

      <Text tone="muted" size="sm">
        Files are read and hashed in your browser — nothing is uploaded.
      </Text>
    </Stack>
  );
}
