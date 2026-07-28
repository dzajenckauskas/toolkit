'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { ImageDropzone } from '@/components/tools/shared/ImageDropzone';
import { clipboardImageFiles } from '@toolkit/lib/clipboard';
import { validateImageFile } from '@toolkit/lib/image';
import { BACKGROUNDS, framedSize, type Background } from '@toolkit/lib/screenshot';

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

const Stage = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.space(2),
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.color.border}`,
  overflow: 'auto',
}));

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
  fontSize: '0.9rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

const Swatch = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
  width: 40,
  height: 32,
  borderRadius: theme.radius.sm,
  cursor: 'pointer',
  border: `2px solid ${active ? theme.color.accent : theme.color.border}`,
}));

interface Source {
  url: string;
  width: number;
  height: number;
}

export default function ScreenshotBeautifier() {
  const [source, setSource] = useState<Source | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [padding, setPadding] = useState(48);
  const [radius, setRadius] = useState(12);
  const [shadow, setShadow] = useState(24);
  const [bg, setBg] = useState<Background>(BACKGROUNDS[0]!);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
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
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setError(null);
        setSource({ url, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        revoke();
        setError('This image could not be read.');
      };
      img.src = url;
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

  const download = useCallback(() => {
    const img = imgRef.current;
    if (!source || !img) return;
    const { width, height } = framedSize(source.width, source.height, padding);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background: solid or diagonal gradient.
    if (bg.stops.length === 1) {
      ctx.fillStyle = bg.stops[0]!;
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, bg.stops[0]!);
      grad.addColorStop(1, bg.stops[bg.stops.length - 1]!);
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    const x = padding;
    const y = padding;
    const r = Math.min(radius, source.width / 2, source.height / 2);

    const roundRect = () => {
      ctx.beginPath();
      ctx.roundRect(x, y, source.width, source.height, r);
    };

    // Shadow cast by a filled rounded rect, then the image clipped on top.
    if (shadow > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = shadow;
      ctx.shadowOffsetY = Math.round(shadow / 3);
      ctx.fillStyle = '#000';
      roundRect();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    roundRect();
    ctx.clip();
    ctx.drawImage(img, x, y, source.width, source.height);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screenshot.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }, [source, padding, radius, shadow, bg]);

  const openPicker = () => inputRef.current?.click();

  return (
    <Stack gap={4}>
      <HiddenFileInput
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadFile(file);
          e.target.value = '';
        }}
        data-testid="ss-file-input"
      />

      {!source ? (
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
          title="Drop a screenshot here"
          cta="Select a screenshot"
          hint="Add a background, padding, rounded corners and a shadow — all in your browser"
          testId="ss-dropzone"
        />
      ) : null}

      {error ? (
        <Text tone="danger" size="sm" data-testid="ss-error">
          {error}
        </Text>
      ) : null}

      {source ? (
        <Stack gap={3}>
          <Stage>
            <div
              data-testid="ss-preview"
              style={{
                background: bg.css,
                padding,
                borderRadius: 8,
                maxWidth: '100%',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.url}
                alt="Screenshot"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: radius,
                  boxShadow:
                    shadow > 0
                      ? `0 ${Math.round(shadow / 3)}px ${shadow}px rgba(0,0,0,0.35)`
                      : 'none',
                }}
              />
            </div>
          </Stage>

          <Stack direction="row" gap={4} wrap>
            <Field>
              Padding {padding}
              <input
                type="range"
                min={0}
                max={160}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                data-testid="ss-padding"
              />
            </Field>
            <Field>
              Radius {radius}
              <input
                type="range"
                min={0}
                max={48}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                data-testid="ss-radius"
              />
            </Field>
            <Field>
              Shadow {shadow}
              <input
                type="range"
                min={0}
                max={60}
                value={shadow}
                onChange={(e) => setShadow(Number(e.target.value))}
                data-testid="ss-shadow"
              />
            </Field>
          </Stack>

          <Stack direction="row" gap={2} wrap align="center">
            <Text as="span" tone="muted" size="sm" weight={600}>
              Background
            </Text>
            {BACKGROUNDS.map((b) => (
              <Swatch
                key={b.id}
                type="button"
                active={b.id === bg.id}
                style={{ background: b.css }}
                onClick={() => setBg(b)}
                aria-label={b.label}
                data-testid={`ss-bg-${b.id}`}
              />
            ))}
          </Stack>

          <Stack direction="row" gap={2} wrap>
            <Button type="button" variant="primary" onClick={download} data-testid="ss-download">
              Download PNG
            </Button>
            <Button type="button" variant="ghost" onClick={openPicker} data-testid="ss-reset">
              Choose another
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}
