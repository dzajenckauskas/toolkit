'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@/components/ui';
import ImageToolShell, { type LoadedImage } from '@/components/ImageToolShell';
import { renderResized } from '@/lib/image';
import { buildZip, type ZipEntry } from '@/lib/zip';

const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 256] as const;

const Grid = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(2),
}));

const SizeChip = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(1),
  padding: '0.3rem 0.6rem',
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.pill,
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.color.muted,
  cursor: 'pointer',
  '&:has(input:checked)': {
    borderColor: theme.color.accent,
    background: `color-mix(in srgb, ${theme.color.accent} 8%, ${theme.color.surface})`,
  },
}));

export default function FaviconGenerator() {
  const [sizes, setSizes] = useState<number[]>([...FAVICON_SIZES]);

  const toggle = (size: number, on: boolean) =>
    setSizes((current) =>
      on ? [...current, size].sort((a, b) => a - b) : current.filter((s) => s !== size),
    );

  const process = async (image: LoadedImage) => {
    const chosen = sizes.length ? sizes : [...FAVICON_SIZES];
    const entries: ZipEntry[] = [];
    for (const size of chosen) {
      const { blob } = await renderResized(image.file, { width: size, height: size }, 'png');
      entries.push({ name: `favicon-${size}x${size}.png`, data: new Uint8Array(await blob.arrayBuffer()) });
    }
    const zip = buildZip(entries);
    const blob = new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' });
    return { blob, filename: 'favicons.zip' };
  };

  return (
    <ImageToolShell process={process} downloadLabel="Download favicons (ZIP)" testIdPrefix="favicon">
      {() => (
        <Stack gap={3}>
          <Text as="span" tone="muted" size="sm" weight={600}>
            Sizes (px)
          </Text>
          <Grid data-testid="favicon-sizes">
            {FAVICON_SIZES.map((size) => (
              <SizeChip key={size}>
                <input
                  type="checkbox"
                  checked={sizes.includes(size)}
                  onChange={(event) => toggle(size, event.target.checked)}
                  data-testid={`favicon-size-${size}`}
                />
                {size}
              </SizeChip>
            ))}
          </Grid>
          <Text tone="muted" size="sm">
            Square PNG icons at the sizes you pick, packaged as a ZIP. For best results start from a
            square image. Everything runs in your browser.
          </Text>
        </Stack>
      )}
    </ImageToolShell>
  );
}
