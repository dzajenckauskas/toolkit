'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Stack, Text } from '@toolkit/ui';
import BatchImageToolShell from '@/components/tools/shared/BatchImageToolShell';
import { type LoadedImage } from '@/components/tools/shared/ImageToolShell';
import { PresetControls } from '@/components/tools/shared/PresetControls';
import {
  IDENTITY_TRANSFORM,
  extensionFor,
  outputImageName,
  renderTransformed,
  rotateCCW,
  rotateCW,
  type ImageFormat,
  type Transform,
} from '@toolkit/lib/image';
import { loadRotateSettings, saveRotateSettings, type RotateSettings } from '@toolkit/lib/settings';

export default function ImageRotator() {
  const [transform, setTransform] = useState<Transform>(IDENTITY_TRANSFORM);
  const [format, setFormat] = useState<ImageFormat>('png');

  // Restore the last-used output format on mount (client-only, so no
  // hydration mismatch — the rotation itself always resets per batch).
  useEffect(() => {
    setFormat(loadRotateSettings().format);
  }, []);

  // Reset the rotation once, when the first file of a fresh batch loads —
  // not on every subsequent "add more", which would discard the user's
  // in-progress choice for files already in the queue.
  const onFirstLoad = useCallback(() => setTransform(IDENTITY_TRANSFORM), []);

  const settings: RotateSettings = { format };

  const applyPreset = (preset: RotateSettings) => {
    setFormat(preset.format);
    saveRotateSettings(preset);
  };

  const onFormat = (value: ImageFormat) => {
    setFormat(value);
    saveRotateSettings({ format: value });
  };

  // Memoized so its identity only changes when transform/format actually
  // change — BatchImageToolShell reprocesses the whole queue when it does.
  const process = useCallback(
    async (image: LoadedImage) => {
      const { blob } = await renderTransformed(image.file, transform, format);
      return { blob, filename: outputImageName(image.file.name, 'rotated', extensionFor(format)) };
    },
    [transform, format],
  );

  return (
    <BatchImageToolShell
      process={process}
      onFirstLoad={onFirstLoad}
      zipName="rotated-images.zip"
      dropzoneHint="JPG, PNG or WebP · add one or many, or paste with Cmd/Ctrl+V · rotated in your browser"
      testIdPrefix="rotate"
    >
      {() => (
        <Stack gap={3}>
          <Stack direction="row" gap={2} wrap>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTransform((t) => rotateCCW(t))}
              data-testid="rotate-ccw"
            >
              Rotate left
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTransform((t) => rotateCW(t))}
              data-testid="rotate-cw"
            >
              Rotate right
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTransform((t) => ({ ...t, flipH: !t.flipH }))}
              data-testid="rotate-fliph"
            >
              Flip horizontal
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTransform((t) => ({ ...t, flipV: !t.flipV }))}
              data-testid="rotate-flipv"
            >
              Flip vertical
            </Button>
          </Stack>

          <select
            value={format}
            onChange={(event) => onFormat(event.target.value as ImageFormat)}
            aria-label="Output format"
            data-testid="rotate-format"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="webp">WebP</option>
          </select>

          <Text weight={600} data-testid="rotate-output">
            Applying:
            {transform.quarterTurns ? ` rotated ${transform.quarterTurns * 90}°` : ' no rotation'}
            {transform.flipH ? ' · flipped H' : ''}
            {transform.flipV ? ' · flipped V' : ''}
          </Text>

          <PresetControls
            tool="rotate"
            settings={settings}
            onApply={applyPreset}
            testIdPrefix="rotate"
          />
        </Stack>
      )}
    </BatchImageToolShell>
  );
}
