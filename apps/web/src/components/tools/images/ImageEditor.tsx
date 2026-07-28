'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Text } from '@toolkit/ui';
import {
  validateImageFile,
  renderResized,
  renderCropped,
  renderTransformed,
  lockAspect,
  clampSize,
  outputImageName,
  extensionFor,
  IMAGE_FORMATS,
  isLossy,
  IDENTITY_TRANSFORM,
  type ImageFormat,
  type Size,
  type Transform,
} from '@toolkit/lib/image';
import { decodeImage } from '@toolkit/lib/optimize';
import {
  defaultCrop,
  moveRect,
  resizeRect,
  applyAspectRatio,
  ASPECT_RATIOS,
  ASPECT_KEYS,
  HANDLES,
  type Rect,
  type Handle,
  type AspectKey,
} from '@toolkit/lib/crop';
import { formatBytes } from '@toolkit/lib/format';
import { clipboardImageFiles } from '@toolkit/lib/clipboard';

/**
 * Unified image editor: one workspace with the image operations as tabs and the
 * active operation's options in a side panel (compress/convert, resize, crop,
 * rotate/flip), a live preview, an undo stack and a download. Each operation
 * reuses the pure canvas helpers in `@toolkit/lib` — the editor is the shell
 * that composes them and manages history.
 *
 * Working pixels are held losslessly as PNG between edits so repeated operations
 * never compound JPEG artefacts; the chosen format + quality are applied only on
 * export (download and the live size estimate).
 */

type OpTab = 'compress' | 'resize' | 'crop' | 'rotate';

const TABS: { id: OpTab; label: string }[] = [
  { id: 'compress', label: 'Compress & Convert' },
  { id: 'resize', label: 'Resize' },
  { id: 'crop', label: 'Crop' },
  { id: 'rotate', label: 'Rotate & Flip' },
];

interface Working {
  blob: Blob;
  url: string;
  size: Size;
}

const MAX_STAGE = 560;
const DEFAULT_QUALITY = 0.8;

// --- styled ---------------------------------------------------------------

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(4),
}));

const HiddenFileInput = styled('input')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  border: 0,
});

const Dropzone = styled('button')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space(2),
  width: '100%',
  minHeight: 320,
  padding: theme.space(8),
  textAlign: 'center',
  color: theme.color.muted,
  background: theme.color.surface,
  border: `2px dashed ${theme.color.borderStrong}`,
  borderRadius: theme.radius.lg,
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, color 0.15s ease',
  '&:hover, &:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    color: theme.color.text,
  },
}));

const Toolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(1),
  padding: theme.space(1),
  background: theme.color.surface2,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
}));

const Tab = styled('button', { shouldForwardProp: (p) => p !== 'active' })<{ active: boolean }>(
  ({ theme, active }) => ({
    padding: '0.5rem 0.9rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: active ? theme.color.accentContrast : theme.color.text,
    background: active ? theme.color.accent : 'transparent',
    border: '1px solid transparent',
    borderRadius: theme.radius.pill,
    transition: 'background 0.12s ease, color 0.12s ease',
    '&:hover': { background: active ? theme.color.accent : theme.color.surface },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
    },
  }),
);

const Workspace = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 280px',
  gap: theme.space(4),
  alignItems: 'start',
  [`@media (max-width: 820px)`]: { gridTemplateColumns: '1fr' },
}));

const Stage = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 360,
  padding: theme.space(4),
  background: theme.color.surface2,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  overflow: 'hidden',
}));

const StageInner = styled('div')({ position: 'relative', lineHeight: 0 });

const PreviewImg = styled('img')({ display: 'block', maxWidth: '100%', userSelect: 'none' });

const CropBox = styled('div')(({ theme }) => ({
  position: 'absolute',
  boxSizing: 'border-box',
  border: `1px solid ${theme.color.accentContrast}`,
  boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
  cursor: 'move',
  outline: `1px solid ${theme.color.accent}`,
}));

const HandleDot = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: 12,
  height: 12,
  background: theme.color.accent,
  border: `2px solid ${theme.color.accentContrast}`,
  borderRadius: '50%',
}));

const Panel = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(3),
  padding: theme.space(4),
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
}));

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(1),
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.color.text,
}));

const Row = styled('div')(({ theme }) => ({ display: 'flex', gap: theme.space(2) }));

const PanelHeading = styled('h3')(({ theme }) => ({
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 700,
  color: theme.color.text,
}));

const Bottom = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.space(3),
  paddingTop: theme.space(2),
  borderTop: `1px solid ${theme.color.border}`,
  fontSize: '0.85rem',
  color: theme.color.muted,
}));

const Spacer = styled('div')({ flex: 1 });

// --- component ------------------------------------------------------------

export function ImageEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('image');
  const [history, setHistory] = useState<Working[]>([]);
  const [tab, setTab] = useState<OpTab>('compress');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // export settings (compress & convert)
  const [format, setFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [estimate, setEstimate] = useState<number | null>(null);

  // resize fields
  const [resizeW, setResizeW] = useState(0);
  const [resizeH, setResizeH] = useState(0);
  const [lock, setLock] = useState(true);

  // crop
  const [ratio, setRatio] = useState<AspectKey>('free');
  const [crop, setCrop] = useState<Rect | null>(null);

  const current = history.length > 0 ? history[history.length - 1] : undefined;

  // Keep resize inputs in sync with the current image size.
  useEffect(() => {
    if (current) {
      setResizeW(current.size.width);
      setResizeH(current.size.height);
    }
  }, [current]);

  // Seed / reset the crop box whenever entering the crop tab or the image changes.
  useEffect(() => {
    if (tab === 'crop' && current) setCrop(defaultCrop(current.size));
  }, [tab, current]);

  // Live output-size estimate for the compress/convert panel.
  useEffect(() => {
    let cancelled = false;
    if (!current) return;
    const id = setTimeout(() => {
      renderResized(current.blob, current.size, format, quality)
        .then((r) => !cancelled && setEstimate(r.blob.size))
        .catch(() => !cancelled && setEstimate(null));
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [current, format, quality]);

  const pushWorking = useCallback((blob: Blob, size: Size) => {
    const url = URL.createObjectURL(blob);
    setHistory((h) => [...h, { blob, url, size }]);
  }, []);

  const loadFile = useCallback(async (file: File) => {
    const check = validateImageFile(file);
    if (!check.ok) {
      setError(check.message ?? 'Unsupported image.');
      return;
    }
    setError(null);
    try {
      const { width, height } = await decodeImage(file);
      const url = URL.createObjectURL(file);
      setName(file.name.replace(/\.[^.]+$/, '') || 'image');
      setHistory([{ blob: file, url, size: { width, height } }]);
      setTab('compress');
    } catch {
      setError('This image could not be read. Try another file.');
    }
  }, []);

  // Apply an async canvas operation to the current image, pushing to history.
  const applyOp = useCallback(
    async (fn: (w: Working) => Promise<{ blob: Blob; size: Size }>) => {
      if (!current || busy) return;
      setBusy(true);
      setError(null);
      try {
        const { blob, size } = await fn(current);
        pushWorking(blob, size);
      } catch {
        setError('That operation failed. Try another image or setting.');
      } finally {
        setBusy(false);
      }
    },
    [current, busy, pushWorking],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const last = h[h.length - 1];
      if (last) URL.revokeObjectURL(last.url);
      return h.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    history.forEach((w) => URL.revokeObjectURL(w.url));
    setHistory([]);
    setCrop(null);
    setError(null);
  }, [history]);

  // Paste an image from the clipboard.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = clipboardImageFiles(e.clipboardData);
      if (files[0]) void loadFile(files[0]);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile]);

  // Revoke every object URL on unmount.
  useEffect(() => {
    return () => history.forEach((w) => URL.revokeObjectURL(w.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- operations ---------------------------------------------------------

  const applyResize = () =>
    applyOp((w) => renderResized(w.blob, clampSize({ width: resizeW, height: resizeH }), 'png', 1));

  const applyCrop = () => {
    if (!crop) return;
    void applyOp((w) => renderCropped(w.blob, crop, 'png', 1)).then(() => setTab('compress'));
  };

  const applyTransform = (t: Transform) => applyOp((w) => renderTransformed(w.blob, t, 'png', 1));

  const applyCompress = () => applyOp((w) => renderResized(w.blob, w.size, format, quality));

  // Encode the current image at the chosen format + quality and download it.
  const downloadNow = useCallback(async () => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const { blob } = await renderResized(current.blob, current.size, format, quality);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputImageName(name, 'edited', extensionFor(format));
      a.click();
      // Defer revoke so the browser has time to start reading the blob.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setError('Could not export this image. Try a different format.');
    } finally {
      setBusy(false);
    }
  }, [current, busy, format, quality, name]);

  const onResizeInput = (dim: 'w' | 'h', value: number) => {
    if (!current) return;
    if (!lock) {
      if (dim === 'w') setResizeW(value);
      else setResizeH(value);
      return;
    }
    const locked = lockAspect(current.size, dim === 'w' ? { width: value } : { height: value });
    setResizeW(locked.width);
    setResizeH(locked.height);
  };

  // --- crop overlay geometry ---------------------------------------------

  const stageScale = (() => {
    if (!current) return 1;
    const el = stageRef.current;
    const maxW = Math.min(MAX_STAGE, (el?.clientWidth ?? MAX_STAGE) - 32);
    return Math.min(1, maxW / current.size.width, MAX_STAGE / current.size.height);
  })();

  const drag = useRef<{ mode: 'move' | Handle; x: number; y: number; rect: Rect } | null>(null);

  const onPointerDown = (mode: 'move' | Handle) => (e: React.PointerEvent) => {
    if (!crop) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { mode, x: e.clientX, y: e.clientY, rect: crop };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !current) return;
    const dx = (e.clientX - d.x) / stageScale;
    const dy = (e.clientY - d.y) / stageScale;
    const r =
      d.mode === 'move'
        ? moveRect(d.rect, dx, dy, current.size)
        : resizeRect(d.rect, d.mode, dx, dy, current.size, ASPECT_RATIOS[ratio]);
    setCrop(r);
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const chooseRatio = (key: AspectKey) => {
    setRatio(key);
    const r = ASPECT_RATIOS[key];
    if (r && crop && current) setCrop(applyAspectRatio(crop, r, current.size));
  };

  // --- render -------------------------------------------------------------

  if (!current) {
    return (
      <Root>
        <HiddenFileInput
          ref={inputRef}
          type="file"
          accept="image/*"
          data-testid="image-editor-file-input"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void loadFile(f);
            e.target.value = '';
          }}
        />
        <Dropzone
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void loadFile(f);
          }}
          data-testid="image-editor-dropzone"
        >
          <Text weight={600}>Drop an image, click to browse, or paste</Text>
          <Text tone="muted" size="sm">
            JPG, PNG, WebP, GIF or BMP — everything stays on your device.
          </Text>
        </Dropzone>
        {error ? (
          <Text tone="danger" size="sm" data-testid="image-editor-error">
            {error}
          </Text>
        ) : null}
      </Root>
    );
  }

  const displayW = Math.round(current.size.width * stageScale);
  const displayH = Math.round(current.size.height * stageScale);

  return (
    <Root>
      <Toolbar role="tablist" aria-label="Image operations">
        {TABS.map((t) => (
          <Tab
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
            data-testid={`editor-tab-${t.id}`}
          >
            {t.label}
          </Tab>
        ))}
      </Toolbar>

      <Workspace>
        <Stage ref={stageRef}>
          <StageInner style={{ width: displayW, height: displayH }}>
            <PreviewImg
              src={current.url}
              alt="Working image"
              width={displayW}
              height={displayH}
              draggable={false}
            />
            {tab === 'crop' && crop ? (
              <CropBox
                style={{
                  left: crop.x * stageScale,
                  top: crop.y * stageScale,
                  width: crop.width * stageScale,
                  height: crop.height * stageScale,
                }}
                onPointerDown={onPointerDown('move')}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                data-testid="editor-crop-box"
              >
                {HANDLES.map((h) => (
                  <HandleDot
                    key={h}
                    onPointerDown={onPointerDown(h)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    data-testid={`editor-crop-handle-${h}`}
                    style={{
                      left: h.includes('w') ? -6 : undefined,
                      right: h.includes('e') ? -6 : undefined,
                      top: h.includes('n') ? -6 : undefined,
                      bottom: h.includes('s') ? -6 : undefined,
                      cursor: `${h}-resize`,
                    }}
                  />
                ))}
              </CropBox>
            ) : null}
          </StageInner>
        </Stage>

        <Panel data-testid="editor-panel">
          {tab === 'compress' ? (
            <>
              <PanelHeading>Compress &amp; Convert</PanelHeading>
              <Field>
                Format
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ImageFormat)}
                  data-testid="editor-format"
                >
                  {IMAGE_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {f.toUpperCase()}
                    </option>
                  ))}
                </select>
              </Field>
              {isLossy(format) ? (
                <Field>
                  Quality: {Math.round(quality * 100)}%
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round(quality * 100)}
                    onChange={(e) => setQuality(Number(e.target.value) / 100)}
                    data-testid="editor-quality"
                  />
                </Field>
              ) : null}
              <Text tone="muted" size="sm" data-testid="editor-estimate">
                Output: {estimate != null ? formatBytes(estimate) : '…'} ({current.size.width} ×{' '}
                {current.size.height})
              </Text>
              <Button type="button" onClick={applyCompress} disabled={busy}>
                Apply
              </Button>
            </>
          ) : null}

          {tab === 'resize' ? (
            <>
              <PanelHeading>Resize</PanelHeading>
              <Row>
                <Field>
                  Width
                  <input
                    type="number"
                    min={1}
                    value={resizeW}
                    onChange={(e) => onResizeInput('w', Number(e.target.value))}
                    data-testid="editor-resize-width"
                  />
                </Field>
                <Field>
                  Height
                  <input
                    type="number"
                    min={1}
                    value={resizeH}
                    onChange={(e) => onResizeInput('h', Number(e.target.value))}
                    data-testid="editor-resize-height"
                  />
                </Field>
              </Row>
              <Field style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={lock}
                  onChange={(e) => setLock(e.target.checked)}
                  data-testid="editor-resize-lock"
                />
                Lock aspect ratio
              </Field>
              <Button type="button" onClick={applyResize} disabled={busy}>
                Apply
              </Button>
            </>
          ) : null}

          {tab === 'crop' ? (
            <>
              <PanelHeading>Crop</PanelHeading>
              <Field>
                Aspect ratio
                <select
                  value={ratio}
                  onChange={(e) => chooseRatio(e.target.value as AspectKey)}
                  data-testid="editor-crop-ratio"
                >
                  {ASPECT_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k === 'free' ? 'Free' : k}
                    </option>
                  ))}
                </select>
              </Field>
              <Button type="button" onClick={applyCrop} disabled={busy}>
                Apply crop
              </Button>
            </>
          ) : null}

          {tab === 'rotate' ? (
            <>
              <PanelHeading>Rotate &amp; Flip</PanelHeading>
              <Row>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => applyTransform({ ...IDENTITY_TRANSFORM, quarterTurns: 3 })}
                  disabled={busy}
                  data-testid="editor-rotate-left"
                >
                  ⟲ Left
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => applyTransform({ ...IDENTITY_TRANSFORM, quarterTurns: 1 })}
                  disabled={busy}
                  data-testid="editor-rotate-right"
                >
                  ⟳ Right
                </Button>
              </Row>
              <Row>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => applyTransform({ ...IDENTITY_TRANSFORM, flipH: true })}
                  disabled={busy}
                  data-testid="editor-flip-h"
                >
                  ↔ Flip
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => applyTransform({ ...IDENTITY_TRANSFORM, flipV: true })}
                  disabled={busy}
                  data-testid="editor-flip-v"
                >
                  ↕ Flip
                </Button>
              </Row>
            </>
          ) : null}
        </Panel>
      </Workspace>

      <Bottom>
        <span data-testid="editor-dimensions">
          {current.size.width} × {current.size.height} px
        </span>
        <span data-testid="editor-filesize">{formatBytes(current.blob.size)}</span>
        {error ? (
          <Text tone="danger" size="sm" data-testid="image-editor-error">
            {error}
          </Text>
        ) : null}
        <Spacer />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={history.length <= 1 || busy}
          data-testid="editor-undo"
        >
          Undo
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="editor-new">
          New
        </Button>
        <Button type="button" onClick={downloadNow} disabled={busy} data-testid="editor-download">
          Download
        </Button>
      </Bottom>
    </Root>
  );
}

export default ImageEditor;
