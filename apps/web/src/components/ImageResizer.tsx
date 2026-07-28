'use client';

import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import ImageToolShell, { type LoadedImage } from '@/components/ImageToolShell';
import {
  clampSize,
  extensionFor,
  lockAspect,
  outputImageName,
  renderResized,
  type ImageFormat,
  type Size,
} from '@/lib/image';

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(1),
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

const NumberInput = styled('input')(({ theme }) => ({
  width: '7rem',
  padding: '0.4rem 0.6rem',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: '8px',
}));

const Toggle = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
  fontSize: '0.9rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

export default function ImageResizer() {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [original, setOriginal] = useState<Size>({ width: 0, height: 0 });
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<ImageFormat>('png');

  const onLoad = useCallback((image: LoadedImage) => {
    setOriginal({ width: image.width, height: image.height });
    setSize({ width: image.width, height: image.height });
  }, []);

  const process = async (image: LoadedImage) => {
    const target = size.width > 0 ? size : { width: image.width, height: image.height };
    const { blob } = await renderResized(image.file, target, format);
    return { blob, filename: outputImageName(image.file.name, 'resized', extensionFor(format)) };
  };

  const onWidth = (value: number) =>
    setSize(
      keepAspect ? lockAspect(original, { width: value }) : clampSize({ ...size, width: value }),
    );
  const onHeight = (value: number) =>
    setSize(
      keepAspect ? lockAspect(original, { height: value }) : clampSize({ ...size, height: value }),
    );

  return (
    <ImageToolShell
      process={process}
      onLoad={onLoad}
      downloadLabel="Download resized image"
      testIdPrefix="resize"
    >
      {() => (
        <Stack gap={3}>
          <Stack direction="row" gap={3} wrap align="flex-end">
            <Field>
              Width (px)
              <NumberInput
                type="number"
                min={1}
                value={size.width}
                onChange={(event) => onWidth(Number(event.target.value))}
                data-testid="resize-width"
              />
            </Field>
            <Field>
              Height (px)
              <NumberInput
                type="number"
                min={1}
                value={size.height}
                onChange={(event) => onHeight(Number(event.target.value))}
                data-testid="resize-height"
              />
            </Field>
            <Field>
              Format
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value as ImageFormat)}
                data-testid="resize-format"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPG</option>
                <option value="webp">WebP</option>
              </select>
            </Field>
          </Stack>
          <Toggle>
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(event) => setKeepAspect(event.target.checked)}
              data-testid="resize-lock"
            />
            Lock aspect ratio
          </Toggle>
          <Text weight={600} numeric data-testid="resize-output">
            Output: {size.width} × {size.height} px
          </Text>
        </Stack>
      )}
    </ImageToolShell>
  );
}
