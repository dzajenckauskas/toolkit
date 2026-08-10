'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { ImageDropzone } from '@/components/tools/shared/ImageDropzone';
import { validateImageFile } from '@toolkit/lib/image';
import { buildPdf, type PdfImage } from '@toolkit/lib/images-to-pdf';

interface Item extends PdfImage {
  id: string;
  url: string;
  name: string;
}

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

const Thumbs = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(2),
  flexWrap: 'wrap',
}));

const Thumb = styled('div')(({ theme }) => ({
  position: 'relative',
  width: 96,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.sm,
  overflow: 'hidden',
  background: theme.color.surface,
  cursor: 'grab',
  transition: 'border-color .16s ease, box-shadow .16s ease, opacity .16s ease',
  '&[data-dragging]': { opacity: 0.42, cursor: 'grabbing' },
  '&[data-drop-target]': {
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 30%, transparent)`,
  },
}));

const PreviewButton = styled('button')(({ theme }) => ({
  position: 'absolute',
  top: theme.space(1),
  right: theme.space(1),
  zIndex: 1,
  width: 26,
  height: 26,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  background: 'rgba(25,26,28,.68)',
  border: '1px solid rgba(255,255,255,.28)',
  borderRadius: theme.radius.sm,
  cursor: 'zoom-in',
  transition: 'background-color .16s ease, border-color .16s ease, box-shadow .16s ease',
  '&:hover': { background: 'rgba(25,26,28,.88)', borderColor: 'rgba(255,255,255,.7)' },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(255,255,255,.68)',
  },
}));

const ThumbPreview = styled('img')({
  width: '100%',
  display: 'block',
  aspectRatio: '4 / 5',
  objectFit: 'cover',
  objectPosition: 'center',
});

const ThumbActions = styled('div')(({ theme }) => ({
  padding: theme.space(1),
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.space(1),
}));

const ThumbButton = styled(Button)({
  width: '100%',
  minWidth: 0,
  height: 26,
  minHeight: 26,
  padding: 0,
  lineHeight: 1,
});

const ThumbIcon = styled('svg')({
  width: 13,
  height: 13,
  display: 'block',
  flex: '0 0 auto',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

const PreviewIcon = styled('svg')({
  width: 13,
  height: 13,
  display: 'block',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

const PreviewDialog = styled('dialog')(({ theme }) => ({
  width: 'min(1200px, calc(100vw - 2rem))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 2rem)',
  padding: 0,
  overflow: 'hidden',
  color: '#f2f0ec',
  background: '#111712',
  border: 0,
  borderRadius: theme.radius.lg,
  '&::backdrop': { background: 'rgba(0,0,0,.8)' },
}));

const PreviewHead = styled('div')(({ theme }) => ({
  padding: theme.space(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(3),
  borderBottom: '1px solid rgba(255,255,255,.14)',
  '& div': { minWidth: 0 },
  '& strong': { display: 'block' },
  '& span': {
    display: 'block',
    overflow: 'hidden',
    color: 'rgba(242,240,236,.7)',
    fontSize: '.75rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const PreviewClose = styled(Button)({
  color: '#f2f0ec',
  background: 'rgba(255,255,255,.04)',
  borderColor: 'rgba(242,240,236,.72)',
  '&:hover': {
    color: '#ffffff',
    background: 'rgba(255,255,255,.12)',
    borderColor: '#ffffff',
  },
});

const FullPreview = styled('img')({
  width: '100%',
  height: 'auto',
  maxHeight: 'calc(100dvh - 7rem)',
  display: 'block',
  objectFit: 'contain',
  background: '#080b09',
});

function toJpeg(
  file: File,
): Promise<{ jpeg: Uint8Array; width: number; height: number; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('no ctx'));
        return;
      }
      ctx.fillStyle = '#ffffff'; // flatten any transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('encode failed'));
            return;
          }
          resolve({
            jpeg: new Uint8Array(await blob.arrayBuffer()),
            width: img.naturalWidth,
            height: img.naturalHeight,
            url,
          });
        },
        'image/jpeg',
        0.9,
      );
    };
    img.onerror = () => reject(new Error('decode failed'));
    img.src = url;
  });
}

export default function ImagesToPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewDialogRef = useRef<HTMLDialogElement>(null);
  const urlsRef = useRef<string[]>([]);
  const previewItem = items.find((item) => item.id === previewId) ?? null;

  useEffect(
    () => () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  useEffect(() => {
    const dialog = previewDialogRef.current;
    if (!dialog) return;
    if (previewItem && !dialog.open) dialog.showModal();
    if (!previewItem && dialog.open) dialog.close();
  }, [previewItem]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const validation = validateImageFile(file);
      if (!validation.ok) {
        setError(validation.message ?? 'Unsupported file skipped.');
        continue;
      }
      try {
        const { jpeg, width, height, url } = await toJpeg(file);
        urlsRef.current.push(url);
        setItems((prev) => [
          ...prev,
          {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            jpeg,
            width,
            height,
            url,
            name: file.name,
          },
        ]);
        setError(null);
      } catch {
        setError('One image could not be processed.');
      }
    }
  }, []);

  const remove = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));
  const move = (id: string, dir: -1 | 1) =>
    setItems((prev) => {
      const i = prev.findIndex((it) => it.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  const reorder = (sourceId: string, targetId: string) =>
    setItems((prev) => {
      const sourceIndex = prev.findIndex((item) => item.id === sourceId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      if (!moved) return prev;
      next.splice(targetIndex, 0, moved);
      return next;
    });
  const finishDrag = () => {
    setDraggedId(null);
    setDropTargetId(null);
  };

  const download = () => {
    if (items.length === 0) return;
    const pdf = buildPdf(items.map(({ jpeg, width, height }) => ({ jpeg, width, height })));
    const blob = new Blob([pdf.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'images.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Stack gap={4}>
      <HiddenFileInput
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = '';
        }}
        data-testid="pdf-file-input"
      />

      <ImageDropzone
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) void addFiles(e.dataTransfer.files);
        }}
        title="Add images (JPG, PNG, WebP…)"
        cta="Select images"
        hint="One image per page, in order · built into a PDF in your browser"
        testId="pdf-dropzone"
      />

      {error ? (
        <Text tone="danger" size="sm" data-testid="pdf-error">
          {error}
        </Text>
      ) : null}

      {items.length > 0 ? (
        <Thumbs data-testid="pdf-thumbs" role="list" aria-label="PDF page order">
          {items.map((it, i) => (
            <Thumb
              key={it.id}
              data-testid="pdf-thumb"
              role="listitem"
              draggable
              data-dragging={draggedId === it.id ? '' : undefined}
              data-drop-target={dropTargetId === it.id ? '' : undefined}
              aria-label={`Page ${i + 1}: ${it.name}. Drag to reorder or use the arrow buttons.`}
              onDragStart={(event) => {
                if ((event.target as HTMLElement).closest('button')) {
                  event.preventDefault();
                  return;
                }
                setDraggedId(it.id);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', it.id);
              }}
              onDragEnter={() => {
                if (draggedId && draggedId !== it.id) setDropTargetId(it.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                if (draggedId && draggedId !== it.id) setDropTargetId(it.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceId = event.dataTransfer.getData('text/plain') || draggedId;
                if (sourceId) reorder(sourceId, it.id);
                finishDrag();
              }}
              onDragEnd={finishDrag}
            >
              <PreviewButton
                type="button"
                aria-label={`Preview ${it.name}`}
                onClick={() => setPreviewId(it.id)}
              >
                <PreviewIcon viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6 3H3v3M10 3h3v3M3 10v3h3M13 10v3h-3" />
                </PreviewIcon>
              </PreviewButton>
              <ThumbPreview src={it.url} alt={it.name} draggable={false} />
              <ThumbActions data-testid="pdf-thumb-actions">
                <ThumbButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => move(it.id, -1)}
                  disabled={i === 0}
                  aria-label="Move earlier"
                >
                  <ThumbIcon viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M13 8H3M7 4 3 8l4 4" />
                  </ThumbIcon>
                </ThumbButton>
                <ThumbButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => move(it.id, 1)}
                  disabled={i === items.length - 1}
                  aria-label="Move later"
                >
                  <ThumbIcon viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </ThumbIcon>
                </ThumbButton>
                <ThumbButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(it.id)}
                  aria-label="Remove"
                  data-testid="pdf-remove"
                >
                  <ThumbIcon viewBox="0 0 16 16" aria-hidden="true">
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </ThumbIcon>
                </ThumbButton>
              </ThumbActions>
            </Thumb>
          ))}
        </Thumbs>
      ) : null}

      <Stack direction="row" gap={2}>
        <Button
          type="button"
          variant="primary"
          onClick={download}
          disabled={items.length === 0}
          data-testid="pdf-download"
        >
          Download PDF ({items.length})
        </Button>
      </Stack>

      <PreviewDialog
        ref={previewDialogRef}
        aria-labelledby="pdf-preview-title"
        onClose={() => setPreviewId(null)}
      >
        <PreviewHead>
          <div>
            <strong id="pdf-preview-title">Image preview</strong>
            <span>{previewItem?.name}</span>
          </div>
          <PreviewClose type="button" size="sm" variant="ghost" onClick={() => setPreviewId(null)}>
            Close
          </PreviewClose>
        </PreviewHead>
        {previewItem ? (
          <FullPreview src={previewItem.url} alt={`Full-size preview of ${previewItem.name}`} />
        ) : null}
      </PreviewDialog>
    </Stack>
  );
}
