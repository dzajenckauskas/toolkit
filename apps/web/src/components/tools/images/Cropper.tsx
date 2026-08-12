'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { clipboardImageFiles } from '@toolkit/lib/clipboard';
import { BALANCED_JPEG_QUALITY } from '@toolkit/lib/constants';
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_MIME,
  DEFAULT_IMAGE_BACKGROUND,
  extensionFor,
  formatHasAlpha,
  imageFormatForInput,
  isLossy,
  mimeFor,
  outputImageName,
  validateImageFile,
  type ImageFormat,
} from '@toolkit/lib/image';
import {
  ASPECT_KEYS,
  ASPECT_RATIOS,
  EXPORT_SIZES,
  EXPORT_SIZE_KEYS,
  HANDLES,
  MARKETPLACE_KEYS,
  MARKETPLACE_PRESETS,
  applyAspectRatio,
  defaultCrop,
  moveRect,
  presetRatio,
  resizeRect,
  resolveOutputSize,
  type AspectKey,
  type ExportSizeKey,
  type Handle,
  type MarketplaceKey,
  type Rect,
} from '@toolkit/lib/crop';
import { Button, HiddenFileInput, Stack, Text } from '@toolkit/ui';
import { ImageDropzone } from '@/components/tools/shared/ImageDropzone';

const MAX_DISPLAY = 560;
const KEY_STEP = 10;
const ZOOM_LEVELS = [1, 1.5, 2, 3] as const;

interface Source {
  url: string;
  fileName: string;
  format: ImageFormat;
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

const Viewport = styled('div')(({ theme }) => ({
  maxWidth: '100%',
  overflow: 'auto',
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.sm,
  lineHeight: 0,
}));

const Stage = styled('div')({
  position: 'relative',
  lineHeight: 0,
  userSelect: 'none',
  touchAction: 'none',
});

const StageImage = styled('img')({
  display: 'block',
  width: '100%',
  height: 'auto',
});

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

const RatioFieldset = styled('fieldset')(({ theme }) => ({
  margin: 0,
  padding: theme.space(3),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  '&:disabled': { opacity: 0.5 },
  '& legend': {
    padding: `0 ${theme.space(1)}`,
    fontSize: '0.85rem',
    fontWeight: 600,
    color: theme.color.muted,
  },
}));

const RatioOptions = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(2),
}));

const RatioOption = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
  padding: '0.5rem 0.75rem',
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
  '&:focus-within': {
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
  '&:has(input:checked)': {
    borderColor: theme.color.accent,
    background: `color-mix(in srgb, ${theme.color.accent} 8%, ${theme.color.surface})`,
  },
  '& input': { width: '1rem', height: '1rem', accentColor: theme.color.accent },
}));

export default function Cropper() {
  const [source, setSource] = useState<Source | null>(null);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ratioKey, setRatioKey] = useState<AspectKey>('free');
  const [exportKey, setExportKey] = useState<ExportSizeKey>('original');
  const [presetKey, setPresetKey] = useState<MarketplaceKey | null>(null);
  const [zoom, setZoom] = useState(1);

  // A marketplace preset overrides the free aspect ratio and export size: it
  // locks the crop to the preset's ratio and forces its exact output size.
  const activeRatio = presetKey ? presetRatio(presetKey) : ASPECT_RATIOS[ratioKey];

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
      const validation = validateImageFile(file);
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
      setSource({
        url,
        fileName: file.name,
        format: imageFormatForInput(file.type, file.name),
        naturalWidth: 0,
        naturalHeight: 0,
      });
    },
    [revokeUrl],
  );

  const onImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      setSource((current) => (current ? { ...current, naturalWidth, naturalHeight } : current));
      const bounds = { width: naturalWidth, height: naturalHeight };
      const base = defaultCrop(bounds);
      setCrop(activeRatio ? applyAspectRatio(base, activeRatio, bounds) : base);
    },
    [activeRatio],
  );

  const onImageError = useCallback(() => {
    revokeUrl();
    setSource(null);
    setCrop(null);
    setError('This image could not be read. It may be corrupt or an unsupported format.');
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

  const displayBase =
    source && source.naturalWidth > 0 ? Math.min(source.naturalWidth, MAX_DISPLAY) : 0;
  const displayWidth = displayBase * zoom;
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
          : resizeRect(drag.startRect, drag.mode, dx, dy, bounds, activeRatio),
      );
    },
    [source, scale, activeRatio],
  );

  const handleRatioChange = useCallback(
    (key: AspectKey) => {
      setRatioKey(key);
      const ratio = ASPECT_RATIOS[key];
      if (ratio && source && crop) {
        const bounds = { width: source.naturalWidth, height: source.naturalHeight };
        setCrop(applyAspectRatio(crop, ratio, bounds));
      }
    },
    [source, crop],
  );

  const handlePresetChange = useCallback(
    (key: MarketplaceKey | null) => {
      setPresetKey(key);
      // Selecting a preset locks the crop box to its ratio; clearing it leaves
      // the crop as-is and hands control back to the free ratio/export options.
      if (key && source && crop) {
        const bounds = { width: source.naturalWidth, height: source.naturalHeight };
        setCrop(applyAspectRatio(crop, presetRatio(key), bounds));
      }
    },
    [source, crop],
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
    const out = resolveOutputSize(crop, presetKey, EXPORT_SIZES[exportKey]);
    const canvas = document.createElement('canvas');
    canvas.width = out.width;
    canvas.height = out.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { format } = source;
    // JPEG has no alpha: fill first so a transparent source doesn't go black.
    if (!formatHasAlpha(format)) {
      ctx.fillStyle = DEFAULT_IMAGE_BACKGROUND;
      ctx.fillRect(0, 0, out.width, out.height);
    }
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
        anchor.download = outputImageName(source.fileName, 'cropped', extensionFor(format));
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      mimeFor(format),
      isLossy(format) ? BALANCED_JPEG_QUALITY : undefined,
    );
  }, [crop, source, exportKey, presetKey]);

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

  const out = crop ? resolveOutputSize(crop, presetKey, EXPORT_SIZES[exportKey]) : null;
  const ready = source !== null && source.naturalWidth > 0 && crop !== null;

  return (
    <section aria-labelledby="tool-heading">
      <HiddenFileInput
        ref={inputRef}
        type="file"
        accept={[...ACCEPTED_IMAGE_MIME, ...ACCEPTED_IMAGE_EXTENSIONS].join(',')}
        onChange={onInputChange}
        data-testid="crop-file-input"
      />

      <Stack gap={4}>
        {!source ? (
          <ImageDropzone
            active={isDragging}
            ariaLabel="Add an image by choosing a file, dropping it, or pasting"
            onClick={openPicker}
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
            title="Drop an image here"
            cta="Select an image"
            hint="JPG, PNG or WebP · crop it in your browser, then download · paste with Cmd/Ctrl+V"
            testId="crop-dropzone"
          />
        ) : null}

        {error ? (
          <Text tone="danger" size="sm" data-testid="crop-error">
            {error}
          </Text>
        ) : null}

        {source ? (
          <Stack gap={3} align="flex-start">
            <RatioFieldset data-testid="crop-preset">
              <legend>Marketplace preset</legend>
              <RatioOptions>
                <RatioOption>
                  <input
                    type="radio"
                    name="marketplace-preset"
                    value="none"
                    checked={presetKey === null}
                    onChange={() => handlePresetChange(null)}
                    data-testid="crop-preset-none"
                  />
                  None
                </RatioOption>
                {MARKETPLACE_KEYS.map((key) => (
                  <RatioOption key={key}>
                    <input
                      type="radio"
                      name="marketplace-preset"
                      value={key}
                      checked={presetKey === key}
                      onChange={() => handlePresetChange(key)}
                      data-testid={`crop-preset-${key}`}
                    />
                    {MARKETPLACE_PRESETS[key].label}
                  </RatioOption>
                ))}
              </RatioOptions>
            </RatioFieldset>

            <RatioFieldset data-testid="crop-ratio" disabled={presetKey !== null}>
              <legend>Aspect ratio</legend>
              <RatioOptions>
                {ASPECT_KEYS.map((key) => (
                  <RatioOption key={key}>
                    <input
                      type="radio"
                      name="aspect-ratio"
                      value={key}
                      checked={ratioKey === key}
                      onChange={() => handleRatioChange(key)}
                      data-testid={`crop-ratio-${key}`}
                    />
                    {key === 'free' ? 'Free' : key}
                  </RatioOption>
                ))}
              </RatioOptions>
            </RatioFieldset>

            <RatioFieldset data-testid="crop-export" disabled={presetKey !== null}>
              <legend>Export size (longest edge)</legend>
              <RatioOptions>
                {EXPORT_SIZE_KEYS.map((key) => (
                  <RatioOption key={key}>
                    <input
                      type="radio"
                      name="export-size"
                      value={key}
                      checked={exportKey === key}
                      onChange={() => setExportKey(key)}
                      data-testid={`crop-export-${key}`}
                    />
                    {key === 'original' ? 'Original' : `${key} px`}
                  </RatioOption>
                ))}
              </RatioOptions>
            </RatioFieldset>

            <RatioFieldset data-testid="crop-zoom">
              <legend>Zoom</legend>
              <RatioOptions>
                {ZOOM_LEVELS.map((level) => (
                  <RatioOption key={level}>
                    <input
                      type="radio"
                      name="zoom"
                      value={level}
                      checked={zoom === level}
                      onChange={() => setZoom(level)}
                      data-testid={`crop-zoom-${level}`}
                    />
                    {level}×
                  </RatioOption>
                ))}
              </RatioOptions>
            </RatioFieldset>

            <Viewport>
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
            </Viewport>

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
                Download cropped image
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
