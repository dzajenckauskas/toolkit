'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { validateFile } from '@/lib/validation';
import { generateOutputFilename } from '@/lib/filename';
import { clipboardImageFiles } from '@/lib/clipboard';
import { BALANCED_JPEG_QUALITY, ACCEPTED_EXTENSIONS } from '@/lib/constants';
import {
  HANDLES,
  defaultCrop,
  moveRect,
  outputSize,
  resizeRect,
  type Handle,
  type Rect,
} from '@/lib/crop';
import { Button, Stack, Text } from '@/components/ui';

const MAX_DISPLAY = 560;
const KEY_STEP = 10;

interface Source {
  url: string;
  fileName: string;
  naturalWidth: number;
  naturalHeight: number;
}

interface DragState {
  mode: 'move' | Handle;
  startX: number;
  startY: number;
  startRect: Rect;
}

const cursorFor: Record<Handle, string> = {
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  se: 'nwse-resize',
};

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

const Dropzone = styled('div', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  border: `2px dashed ${active ? theme.color.accent : theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  background: active
    ? `color-mix(in srgb, ${theme.color.accent} 8%, ${theme.color.surface})`
    : theme.color.surface,
  padding: '2.5rem 1.5rem',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, background 0.15s ease',
  '&:hover': { borderColor: theme.color.accent },
  '&:focus-visible': {
    borderColor: theme.color.accent,
    outline: 'none',
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

const Stage = styled('div')({
  position: 'relative',
  lineHeight: 0,
  userSelect: 'none',
  touchAction: 'none',
  maxWidth: '100%',
});

const StageImage = styled('img')(({ theme }) => ({
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: theme.radius.sm,
}));

const CropBox = styled('div')({
  position: 'absolute',
  boxSizing: 'border-box',
  border: '1px solid #fff',
  outline: '1px solid rgba(0,0,0,0.5)',
  boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
  cursor: 'move',
  touchAction: 'none',
  '&:focus-visible': {
    outline: '2px solid #fff',
  },
});

const HandleDot = styled('span')<{ handle: Handle }>(({ handle }) => ({
  position: 'absolute',
  width: 14,
  height: 14,
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.5)',
  borderRadius: 3,
  touchAction: 'none',
  cursor: cursorFor[handle],
  top: handle === 'nw' || handle === 'ne' ? -7 : undefined,
  bottom: handle === 'sw' || handle === 'se' ? -7 : undefined,
  left: handle === 'nw' || handle === 'sw' ? -7 : undefined,
  right: handle === 'ne' || handle === 'se' ? -7 : undefined,
}));

export default function Cropper() {
  const [source, setSource] = useState<Source | null>(null);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const revokeUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => () => revokeUrl(), [revokeUrl]);

  const loadFile = useCallback(
    (file: File) => {
      const validation = validateFile(file);
      if (!validation.ok) {
        setError(validation.message ?? 'This file cannot be used.');
        return;
      }
      revokeUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setError(null);
      setCrop(null);
      // Dimensions are filled in once the <img> loads.
      setSource({ url, fileName: file.name, naturalWidth: 0, naturalHeight: 0 });
    },
    [revokeUrl],
  );

  const onImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    setSource((current) => (current ? { ...current, naturalWidth, naturalHeight } : current));
    setCrop(defaultCrop({ width: naturalWidth, height: naturalHeight }));
  }, []);

  const onImageError = useCallback(() => {
    revokeUrl();
    setSource(null);
    setCrop(null);
    setError('This image could not be read. It may be corrupt or not a real JPEG.');
  }, [revokeUrl]);

  // Paste an image anywhere to load it.
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

  const displayWidth =
    source && source.naturalWidth > 0 ? Math.min(source.naturalWidth, MAX_DISPLAY) : 0;
  const scale = source && source.naturalWidth > 0 ? displayWidth / source.naturalWidth : 1;

  const beginDrag = useCallback(
    (mode: 'move' | Handle) => (event: React.PointerEvent) => {
      if (!crop) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = { mode, startX: event.clientX, startY: event.clientY, startRect: crop };
    },
    [crop],
  );

  const onDragMove = useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !source || scale === 0) return;
      const dx = (event.clientX - drag.startX) / scale;
      const dy = (event.clientY - drag.startY) / scale;
      const bounds = { width: source.naturalWidth, height: source.naturalHeight };
      setCrop(
        drag.mode === 'move'
          ? moveRect(drag.startRect, dx, dy, bounds)
          : resizeRect(drag.startRect, drag.mode, dx, dy, bounds),
      );
    },
    [source, scale],
  );

  const endDrag = useCallback((event: React.PointerEvent) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const onBoxKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!crop || !source) return;
      const step = event.shiftKey ? KEY_STEP * 4 : KEY_STEP;
      const bounds = { width: source.naturalWidth, height: source.naturalHeight };
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const delta = moves[event.key];
      if (delta) {
        event.preventDefault();
        setCrop(moveRect(crop, delta[0], delta[1], bounds));
      }
    },
    [crop, source],
  );

  const download = useCallback(() => {
    if (!crop || !source || !imgRef.current) return;
    const out = outputSize(crop);
    const canvas = document.createElement('canvas');
    canvas.width = out.width;
    canvas.height = out.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      imgRef.current,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      out.width,
      out.height,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = generateOutputFilename(source.fileName, 'cropped');
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      'image/jpeg',
      BALANCED_JPEG_QUALITY,
    );
  }, [crop, source]);

  const reset = useCallback(() => {
    revokeUrl();
    setSource(null);
    setCrop(null);
    setError(null);
  }, [revokeUrl]);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) loadFile(file);
      event.target.value = '';
    },
    [loadFile],
  );

  const out = crop ? outputSize(crop) : null;
  const ready = source !== null && source.naturalWidth > 0 && crop !== null;

  return (
    <section aria-labelledby="cropper-heading">
      <HiddenFileInput
        ref={inputRef}
        type="file"
        accept={`image/jpeg,${ACCEPTED_EXTENSIONS.join(',')}`}
        onChange={onInputChange}
        data-testid="crop-file-input"
      />

      <Stack gap={4}>
        {!source ? (
          <Dropzone
            active={isDragging}
            role="button"
            tabIndex={0}
            aria-label="Add a JPEG image by choosing a file, dropping it, or pasting"
            onClick={openPicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPicker();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) loadFile(file);
            }}
            data-testid="crop-dropzone"
          >
            <Text weight={600}>Drop a product photo here, paste, or choose a JPEG.</Text>
            <Text tone="muted" size="sm">
              Crop it in your browser, then download.
            </Text>
          </Dropzone>
        ) : null}

        {error ? (
          <Text tone="danger" size="sm" data-testid="crop-error">
            {error}
          </Text>
        ) : null}

        {source ? (
          <Stack gap={3} align="flex-start">
            <Stage style={{ width: displayWidth || undefined }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <StageImage
                ref={imgRef}
                src={source.url}
                alt={`Crop ${source.fileName}`}
                onLoad={onImageLoad}
                onError={onImageError}
                data-testid="crop-image"
              />
              {ready && crop ? (
                <CropBox
                  role="group"
                  tabIndex={0}
                  aria-label="Crop area — drag to move, use arrow keys to nudge"
                  data-testid="crop-box"
                  onPointerDown={beginDrag('move')}
                  onPointerMove={onDragMove}
                  onPointerUp={endDrag}
                  onKeyDown={onBoxKeyDown}
                  style={{
                    left: crop.x * scale,
                    top: crop.y * scale,
                    width: crop.width * scale,
                    height: crop.height * scale,
                  }}
                >
                  {HANDLES.map((handle) => (
                    <HandleDot
                      key={handle}
                      handle={handle}
                      data-testid={`crop-handle-${handle}`}
                      onPointerDown={beginDrag(handle)}
                      onPointerMove={onDragMove}
                      onPointerUp={endDrag}
                    />
                  ))}
                </CropBox>
              ) : null}
            </Stage>

            <Stack gap={1}>
              <Text tone="muted" size="sm" numeric data-testid="crop-source">
                Source: {source.naturalWidth || '…'} × {source.naturalHeight || '…'} px
              </Text>
              <Text weight={600} numeric data-testid="crop-dimensions">
                Crop output: {out ? `${out.width} × ${out.height} px` : '…'}
              </Text>
            </Stack>

            <Stack direction="row" gap={2} wrap>
              <Button
                type="button"
                variant="primary"
                onClick={download}
                disabled={!ready}
                data-testid="crop-download"
              >
                Download cropped JPEG
              </Button>
              <Button type="button" variant="ghost" onClick={reset} data-testid="crop-reset">
                Choose another
              </Button>
            </Stack>

            <Text tone="muted" size="sm">
              Your image never leaves your device. Cropping runs entirely in your browser.
            </Text>
          </Stack>
        ) : null}
      </Stack>
    </section>
  );
}
