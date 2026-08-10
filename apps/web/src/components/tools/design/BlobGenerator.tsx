'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, DownloadLink, InlineField as Field, Stack, Text } from '@toolkit/ui';
import { blobPath, blobSvg } from '@toolkit/lib/blob';

const SIZE = 240;

const Frame = styled('div')(({ theme }) => ({
  width: SIZE,
  maxWidth: '100%',
  aspectRatio: '1 / 1',
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.color.border}`,
  background: theme.color.surface,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export default function BlobGenerator() {
  const [seed, setSeed] = useState(1);
  const [points, setPoints] = useState(6);
  const [randomness, setRandomness] = useState(0.35);
  const [fill, setFill] = useState('#3366cc');
  const [copied, setCopied] = useState(false);

  const path = useMemo(
    () => blobPath({ seed, points, randomness, size: SIZE }),
    [seed, points, randomness],
  );
  const svg = useMemo(
    () => blobSvg(fill, { seed, points, randomness, size: SIZE }),
    [fill, seed, points, randomness],
  );

  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Stack gap={4}>
      <Frame>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%" data-testid="blob-svg">
          <path d={path} fill={fill} data-testid="blob-path" />
        </svg>
      </Frame>

      <Stack direction="row" gap={4} wrap>
        <Field>
          Color
          <input
            type="color"
            value={fill}
            onChange={(e) => setFill(e.target.value)}
            aria-label="Blob color"
            data-testid="blob-color"
          />
        </Field>
        <Field>
          Points {points}
          <input
            type="range"
            min={4}
            max={12}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            data-testid="blob-points"
          />
        </Field>
        <Field>
          Randomness {Math.round(randomness * 100)}%
          <input
            type="range"
            min={0}
            max={90}
            value={Math.round(randomness * 100)}
            onChange={(e) => setRandomness(Number(e.target.value) / 100)}
            data-testid="blob-randomness"
          />
        </Field>
      </Stack>

      <Stack direction="row" gap={2} wrap>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            setSeed((s) => s + 1);
            setCopied(false);
          }}
          data-testid="blob-randomize"
        >
          Randomize
        </Button>
        <DownloadLink
          href={dataUrl}
          download="blob.svg"
          variant="ghost"
          data-testid="blob-download"
        >
          Download SVG
        </DownloadLink>
        <Button type="button" variant="ghost" onClick={() => void copy()} data-testid="blob-copy">
          {copied ? 'Copied SVG' : 'Copy SVG'}
        </Button>
      </Stack>

      <Text tone="muted" size="sm">
        Organic SVG blobs, generated in your browser. Great for backgrounds and decorations.
      </Text>
    </Stack>
  );
}
