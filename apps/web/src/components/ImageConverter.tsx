'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import ImageToolShell, { type LoadedImage } from '@/components/ImageToolShell';
import {
  extensionFor,
  isLossy,
  outputImageName,
  renderResized,
  type ImageFormat,
} from '@toolkit/lib/image';

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(1),
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

export default function ImageConverter() {
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState(0.9);

  const process = async (image: LoadedImage) => {
    // Convert = redraw at native size into the target format.
    const { blob } = await renderResized(
      image.file,
      { width: image.width, height: image.height },
      format,
      quality,
    );
    return { blob, filename: outputImageName(image.file.name, 'converted', extensionFor(format)) };
  };

  return (
    <ImageToolShell
      process={process}
      downloadLabel="Download converted image"
      testIdPrefix="convert"
    >
      {() => (
        <Stack gap={3}>
          <Field>
            Convert to
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as ImageFormat)}
              data-testid="convert-format"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
              <option value="webp">WebP</option>
            </select>
          </Field>

          {isLossy(format) ? (
            <Field>
              Quality: {Math.round(quality * 100)}%
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round(quality * 100)}
                onChange={(event) => setQuality(Number(event.target.value) / 100)}
                data-testid="convert-quality"
              />
            </Field>
          ) : (
            <Text tone="muted" size="sm">
              PNG is lossless — no quality setting.
            </Text>
          )}
        </Stack>
      )}
    </ImageToolShell>
  );
}
