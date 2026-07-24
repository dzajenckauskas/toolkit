'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@/components/ui';
import ImageToolShell, { type LoadedImage } from '@/components/ImageToolShell';
import { extensionFor, outputImageName, renderResized, type ImageFormat } from '@/lib/image';

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(1),
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

export default function MetadataCleaner() {
  const [format, setFormat] = useState<ImageFormat>('png');

  // Re-drawing the pixels through a canvas discards EXIF/GPS and other metadata.
  const process = async (image: LoadedImage) => {
    const { blob } = await renderResized(
      image.file,
      { width: image.width, height: image.height },
      format,
    );
    return { blob, filename: outputImageName(image.file.name, 'clean', extensionFor(format)) };
  };

  return (
    <ImageToolShell
      process={process}
      downloadLabel="Download clean image"
      testIdPrefix="metadata"
    >
      {() => (
        <Stack gap={3}>
          <Field>
            Output format
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as ImageFormat)}
              data-testid="metadata-format"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
              <option value="webp">WebP</option>
            </select>
          </Field>
          <Text tone="muted" size="sm">
            Re-encoding through a canvas strips EXIF, GPS and other embedded metadata. The visible
            image is unchanged.
          </Text>
        </Stack>
      )}
    </ImageToolShell>
  );
}
