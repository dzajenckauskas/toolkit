'use client';

import { useCallback, useState } from 'react';
import { Button, Stack, Text } from '@toolkit/ui';
import ImageToolShell, { type LoadedImage } from '@/components/ImageToolShell';
import {
  IDENTITY_TRANSFORM,
  extensionFor,
  outputImageName,
  renderTransformed,
  rotateCCW,
  rotateCW,
  rotateSize,
  type ImageFormat,
  type Transform,
} from '@toolkit/lib/image';

export default function ImageRotator() {
  const [transform, setTransform] = useState<Transform>(IDENTITY_TRANSFORM);
  const [original, setOriginal] = useState({ width: 0, height: 0 });
  const [format, setFormat] = useState<ImageFormat>('png');

  const onLoad = useCallback((image: LoadedImage) => {
    setTransform(IDENTITY_TRANSFORM);
    setOriginal({ width: image.width, height: image.height });
  }, []);

  const process = async (image: LoadedImage) => {
    const { blob } = await renderTransformed(image.file, transform, format);
    return { blob, filename: outputImageName(image.file.name, 'rotated', extensionFor(format)) };
  };

  const out = rotateSize(original, transform.quarterTurns);

  return (
    <ImageToolShell
      process={process}
      onLoad={onLoad}
      downloadLabel="Download image"
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
            onChange={(event) => setFormat(event.target.value as ImageFormat)}
            aria-label="Output format"
            data-testid="rotate-format"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="webp">WebP</option>
          </select>

          <Text weight={600} numeric data-testid="rotate-output">
            Output: {out.width} × {out.height} px
            {transform.quarterTurns ? ` · rotated ${transform.quarterTurns * 90}°` : ''}
            {transform.flipH ? ' · flipped H' : ''}
            {transform.flipV ? ' · flipped V' : ''}
          </Text>
        </Stack>
      )}
    </ImageToolShell>
  );
}
