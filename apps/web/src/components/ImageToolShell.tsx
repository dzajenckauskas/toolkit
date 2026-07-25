'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@/components/ui';
import { ImageDropzone } from '@/components/ImageDropzone';
import { clipboardImageFiles } from '@/lib/clipboard';
import { ACCEPTED_IMAGE_EXTENSIONS, ACCEPTED_IMAGE_MIME, validateImageFile } from '@/lib/image';

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

const Preview = styled('img')(({ theme }) => ({
  display: 'block',
  maxWidth: '100%',
  maxHeight: '360px',
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.color.border}`,
}));

export interface LoadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface Props {
  /** Renders the tool's controls; receives the loaded image. */
  children: (image: LoadedImage) => ReactNode;
  /** Produce the output to download from the loaded file. */
  process: (image: LoadedImage) => Promise<{ blob: Blob; filename: string }>;
  /** Fired once when a new image finishes loading (safe place to seed state). */
  onLoad?: (image: LoadedImage) => void;
  downloadLabel: string;
  testIdPrefix: string;
}

export default function ImageToolShell({
  children,
  process,
  onLoad,
  downloadLabel,
  testIdPrefix,
}: Props) {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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
      const probe = new Image();
      probe.onload = () => {
        const loaded = { file, url, width: probe.naturalWidth, height: probe.naturalHeight };
        setError(null);
        setImage(loaded);
        onLoad?.(loaded);
      };
      probe.onerror = () => {
        revoke();
        setError('This image could not be read. It may be corrupt.');
      };
      probe.src = url;
    },
    [revoke, onLoad],
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

  const reset = useCallback(() => {
    revoke();
    setImage(null);
    setError(null);
  }, [revoke]);

  const download = useCallback(async () => {
    if (!image) return;
    setBusy(true);
    try {
      const { blob, filename } = await process(image);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Something went wrong producing the output. Try another image.');
    } finally {
      setBusy(false);
    }
  }, [image, process]);

  const openPicker = () => inputRef.current?.click();

  return (
    <section>
      <HiddenFileInput
        ref={inputRef}
        type="file"
        accept={[...ACCEPTED_IMAGE_MIME, ...ACCEPTED_IMAGE_EXTENSIONS].join(',')}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) loadFile(file);
          event.target.value = '';
        }}
        data-testid={`${testIdPrefix}-file-input`}
      />

      <Stack gap={4}>
        {!image ? (
          <ImageDropzone
            active={dragging}
            onClick={openPicker}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) loadFile(file);
            }}
            hint="JPG, PNG, WebP, GIF or BMP · paste from the clipboard · runs in your browser"
            testId={`${testIdPrefix}-dropzone`}
          />
        ) : null}

        {error ? (
          <Text tone="danger" size="sm" data-testid={`${testIdPrefix}-error`}>
            {error}
          </Text>
        ) : null}

        {image ? (
          <Stack gap={4} align="flex-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Preview
              src={image.url}
              alt={image.file.name}
              data-testid={`${testIdPrefix}-preview`}
            />
            <Text tone="muted" size="sm" numeric data-testid={`${testIdPrefix}-source`}>
              Source: {image.width} × {image.height} px
            </Text>

            {children(image)}

            <Stack direction="row" gap={2} wrap>
              <Button
                type="button"
                variant="primary"
                onClick={() => void download()}
                disabled={busy}
                data-testid={`${testIdPrefix}-download`}
              >
                {busy ? 'Working…' : downloadLabel}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={reset}
                data-testid={`${testIdPrefix}-reset`}
              >
                Choose another
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </section>
  );
}
