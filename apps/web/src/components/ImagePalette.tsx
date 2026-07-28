'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { ImageDropzone } from '@/components/ImageDropzone';
import { clipboardImageFiles } from '@/lib/clipboard';
import { validateImageFile } from '@/lib/image';
import { extractPalette } from '@/lib/image-palette';

const SAMPLE_SIZE = 120; // downscale before sampling for speed

const HiddenFileInput = styled('input')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

const Preview = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '260px',
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.color.border}`,
}));

const Swatches = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(2),
  flexWrap: 'wrap',
}));

const Swatch = styled('button')(({ theme }) => ({
  padding: 0,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  overflow: 'hidden',
  cursor: 'pointer',
  background: theme.color.surface,
}));

const Chip = styled('span')({ width: 80, height: 56, display: 'block' });
const Hex = styled('span')(({ theme }) => ({
  display: 'block',
  padding: '0.25rem 0.4rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
  color: theme.color.text,
}));

export default function ImagePalette() {
  const [url, setUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const revoke = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);
  useEffect(() => () => revoke(), [revoke]);

  const loadFile = useCallback(
    (file: File) => {
      const validation = validateImageFile(file);
      if (!validation.ok) {
        setError(validation.message ?? 'This file cannot be used.');
        return;
      }
      revoke();
      const objectUrl = URL.createObjectURL(file);
      urlRef.current = objectUrl;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, SAMPLE_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not read the image.');
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        setColors(extractPalette(data, 6));
        setError(null);
        setUrl(objectUrl);
      };
      img.onerror = () => {
        revoke();
        setError('This image could not be read.');
      };
      img.src = objectUrl;
    },
    [revoke],
  );

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = clipboardImageFiles(event.clipboardData);
      if (files[0]) {
        event.preventDefault();
        loadFile(files[0]);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile]);

  const copy = (hex: string) => void navigator.clipboard?.writeText(hex).catch(() => {});
  const openPicker = () => inputRef.current?.click();

  return (
    <Stack gap={4}>
      <HiddenFileInput
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) loadFile(file);
          event.target.value = '';
        }}
        data-testid="imgpal-file-input"
      />

      {!url ? (
        <ImageDropzone
          active={dragging}
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) loadFile(file);
          }}
          hint="The palette is extracted in your browser — nothing is uploaded"
          testId="imgpal-dropzone"
        />
      ) : null}

      {error ? (
        <Text tone="danger" size="sm" data-testid="imgpal-error">
          {error}
        </Text>
      ) : null}

      {url ? (
        <Stack gap={3} align="flex-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Preview src={url} alt="Source" data-testid="imgpal-preview" />
          <Swatches data-testid="imgpal-swatches">
            {colors.map((hex, i) => (
              <Swatch
                key={`${hex}-${i}`}
                type="button"
                onClick={() => copy(hex)}
                title={`Copy ${hex}`}
              >
                <Chip style={{ background: hex }} />
                <Hex>{hex}</Hex>
              </Swatch>
            ))}
          </Swatches>
          <Button type="button" variant="ghost" onClick={openPicker} data-testid="imgpal-reset">
            Choose another
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
