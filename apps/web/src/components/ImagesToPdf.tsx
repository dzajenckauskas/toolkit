'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@/components/ui';
import { validateImageFile } from '@/lib/image';
import { buildPdf, type PdfImage } from '@/lib/images-to-pdf';

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

const Dropzone = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  padding: '2rem 1.5rem',
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': { borderColor: theme.color.accent },
}));

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
}));

function toJpeg(file: File): Promise<{ jpeg: Uint8Array; width: number; height: number; url: string }> {
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
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

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
          { id: `${file.name}-${Date.now()}-${Math.random()}`, jpeg, width, height, url, name: file.name },
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

      <Dropzone
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) void addFiles(e.dataTransfer.files);
        }}
        data-testid="pdf-dropzone"
      >
        <Text weight={600}>Add images (JPG, PNG, WebP…)</Text>
        <Text tone="muted" size="sm">
          One image per page, in order. Built into a PDF in your browser.
        </Text>
      </Dropzone>

      {error ? (
        <Text tone="danger" size="sm" data-testid="pdf-error">
          {error}
        </Text>
      ) : null}

      {items.length > 0 ? (
        <Thumbs data-testid="pdf-thumbs">
          {items.map((it, i) => (
            <Thumb key={it.id} data-testid="pdf-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.url} alt={it.name} style={{ display: 'block', width: '100%', height: 'auto' }} />
              <Stack direction="row" gap={1} justify="center" style={{ padding: 4 }}>
                <Button type="button" variant="ghost" size="sm" onClick={() => move(it.id, -1)} disabled={i === 0} aria-label="Move earlier">
                  ←
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => move(it.id, 1)} disabled={i === items.length - 1} aria-label="Move later">
                  →
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(it.id)} aria-label="Remove" data-testid="pdf-remove">
                  ×
                </Button>
              </Stack>
            </Thumb>
          ))}
        </Thumbs>
      ) : null}

      <Stack direction="row" gap={2}>
        <Button type="button" variant="primary" onClick={download} disabled={items.length === 0} data-testid="pdf-download">
          Download PDF ({items.length})
        </Button>
      </Stack>
    </Stack>
  );
}
