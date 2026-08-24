'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import BatchImageToolShell from '@/components/tools/shared/BatchImageToolShell';
import { type LoadedImage } from '@/components/tools/shared/ImageToolShell';
import { PresetControls } from '@/components/tools/shared/PresetControls';
import {
  clampSize,
  extensionFor,
  lockAspect,
  outputImageName,
  renderResized,
  type ImageFormat,
  type Size,
} from '@toolkit/lib/image';
import { loadResizeSettings, saveResizeSettings, type ResizeSettings } from '@toolkit/lib/settings';

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
  borderRadius: theme.radius.md,
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

  // Restore the last-used format/aspect-lock on mount (client-only, so no
  // hydration mismatch — no file is loaded yet, so this triggers no re-render
  // of the image itself).
  useEffect(() => {
    const saved = loadResizeSettings();
    setFormat(saved.format);
    setKeepAspect(saved.keepAspect);
  }, []);

  // Seed the width/height fields once from the first file of a fresh batch —
  // not on every subsequent "add more". Each file still gets its own aspect
  // ratio respected at process time (see `process` below); this seed only
  // gives the number inputs a sensible starting value to edit.
  const onFirstLoad = useCallback((image: LoadedImage) => {
    setOriginal({ width: image.width, height: image.height });
    setSize({ width: image.width, height: image.height });
  }, []);

  const settings: ResizeSettings = { format, keepAspect };

  const applyPreset = (preset: ResizeSettings) => {
    setFormat(preset.format);
    setKeepAspect(preset.keepAspect);
    saveResizeSettings(preset);
  };

  const onFormat = (value: ImageFormat) => {
    setFormat(value);
    saveResizeSettings({ format: value, keepAspect });
  };

  const onKeepAspect = (value: boolean) => {
    setKeepAspect(value);
    saveResizeSettings({ format, keepAspect: value });
  };

  // Memoized so its identity only changes when a setting actually changes —
  // BatchImageToolShell reprocesses the whole queue when it does. With
  // aspect locked, each file's target height is recomputed from *its own*
  // dimensions at the chosen width, so a mixed-aspect-ratio batch never gets
  // stretched to one file's shape; unlocked forces the exact typed size.
  const process = useCallback(
    async (image: LoadedImage) => {
      const target =
        size.width <= 0
          ? { width: image.width, height: image.height }
          : keepAspect
            ? lockAspect({ width: image.width, height: image.height }, { width: size.width })
            : size;
      const { blob } = await renderResized(image.file, target, format);
      return { blob, filename: outputImageName(image.file.name, 'resized', extensionFor(format)) };
    },
    [size, keepAspect, format],
  );

  const onWidth = (value: number) =>
    setSize(
      keepAspect ? lockAspect(original, { width: value }) : clampSize({ ...size, width: value }),
    );
  const onHeight = (value: number) =>
    setSize(
      keepAspect ? lockAspect(original, { height: value }) : clampSize({ ...size, height: value }),
    );

  return (
    <BatchImageToolShell
      process={process}
      onFirstLoad={onFirstLoad}
      zipName="resized-images.zip"
      dropzoneHint="JPG, PNG or WebP · add one or many, or paste with Cmd/Ctrl+V · resized in your browser"
      testIdPrefix="resize"
    >
      {({ count }) => (
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
                onChange={(event) => onFormat(event.target.value as ImageFormat)}
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
              onChange={(event) => onKeepAspect(event.target.checked)}
              data-testid="resize-lock"
            />
            Lock aspect ratio
          </Toggle>
          <Text weight={600} numeric data-testid="resize-output">
            {keepAspect ? `Width: ${size.width} px` : `Output: ${size.width} × ${size.height} px`}
          </Text>
          {count > 1 && keepAspect ? (
            <Text tone="muted" size="sm">
              Height is recalculated per image to preserve each one&rsquo;s own aspect ratio.
            </Text>
          ) : null}
          <PresetControls
            tool="resize"
            settings={settings}
            onApply={applyPreset}
            testIdPrefix="resize"
          />
        </Stack>
      )}
    </BatchImageToolShell>
  );
}
