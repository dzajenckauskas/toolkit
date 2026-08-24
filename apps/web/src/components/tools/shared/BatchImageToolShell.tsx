'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styled from '@emotion/styled';
import { Button, DownloadLink, HiddenFileInput, Stack, Text } from '@toolkit/ui';
import { ImageDropzone } from '@/components/tools/shared/ImageDropzone';
import { type LoadedImage } from '@/components/tools/shared/ImageToolShell';
import { clipboardImageFiles } from '@toolkit/lib/clipboard';
import { decodeImage, ImageDecodeError } from '@toolkit/lib/optimize';
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_MIME,
  validateImageFile,
} from '@toolkit/lib/image';
import { batchCounts, removeItem, updateItem, type BatchItem } from '@toolkit/lib/batch';
import { formatBytes } from '@toolkit/lib/format';
import { buildZip, type ZipEntry } from '@toolkit/lib/zip';

/**
 * Multi-file batch shell for image tools that apply one operation to every
 * loaded file (Resize, Convert, Rotate) — the queue/ZIP pattern proven in
 * Optimizer.tsx, generalized behind a `process` callback so each tool
 * supplies only its own per-image logic and settings UI.
 *
 * Reprocessing is driven by `process`'s identity: the caller must memoize it
 * (`useCallback`) with the settings it depends on, so a genuine settings
 * change re-runs every loaded file exactly once.
 */

const StatusLine = styled('div')(({ theme }) => ({
  minHeight: '1.5rem',
  color: theme.color.muted,
}));

const QueueList = styled('ul')(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(3),
}));

const QueueItemRow = styled('li', {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone?: 'default' | 'danger' }>(({ theme, tone = 'default' }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(3),
  padding: theme.space(3),
  border: `1px solid ${tone === 'danger' ? theme.color.dangerBorder : theme.color.border}`,
  borderRadius: theme.radius.md,
  background: tone === 'danger' ? theme.color.dangerBg : theme.color.surface,
}));

const Thumb = styled('img')(({ theme }) => ({
  width: 56,
  height: 56,
  objectFit: 'cover',
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.color.border}`,
  flex: 'none',
}));

const ThumbEmpty = styled('div')(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: theme.radius.sm,
  flex: 'none',
  background: `color-mix(in srgb, ${theme.color.muted} 20%, ${theme.color.surface})`,
}));

const QueueBody = styled('div')({ flex: '1 1 auto', minWidth: 0 });

const QueueName = styled('p')(({ theme }) => ({
  margin: 0,
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: theme.color.text,
}));

interface Props {
  /** Settings UI for the tool; rendered above the file queue. Receives the current queue size. */
  children: (context: { count: number }) => ReactNode;
  /** Produce the output for one loaded file. Memoize with useCallback. */
  process: (image: LoadedImage) => Promise<{ blob: Blob; filename: string }>;
  /** Fired once, with the first successfully-decoded image of the batch — a safe place to seed settings that depend on source dimensions. */
  onFirstLoad?: (image: LoadedImage) => void;
  /** Filename for the bundled download when 2+ files finish. */
  zipName: string;
  dropzoneHint: string;
  testIdPrefix: string;
}

export default function BatchImageToolShell({
  children,
  process,
  onFirstLoad,
  zipName,
  dropzoneHint,
  testIdPrefix,
}: Props) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<Map<string, File>>(new Map());
  const itemsRef = useRef<BatchItem[]>([]);
  const idCounter = useRef(0);
  const seededRef = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const revokeItemUrls = useCallback((item: BatchItem | undefined) => {
    if (!item) return;
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
  }, []);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
      }
    };
  }, []);

  const nextId = useCallback(() => {
    idCounter.current += 1;
    return `batch-item-${idCounter.current}`;
  }, []);

  const processItem = useCallback(
    async (id: string) => {
      const file = filesRef.current.get(id);
      if (!file) return;

      const previous = itemsRef.current.find((i) => i.id === id);
      setItems((prev) => updateItem(prev, id, { status: 'processing', error: undefined }));

      let previewUrl: string | undefined;
      try {
        const { width, height } = await decodeImage(file);
        previewUrl = URL.createObjectURL(file);
        const loaded: LoadedImage = { file, url: previewUrl, width, height };

        if (!seededRef.current) {
          seededRef.current = true;
          onFirstLoad?.(loaded);
        }

        const { blob, filename } = await process(loaded);
        // The operation can change dimensions (resize/rotate), so the queue
        // row must reflect the *output*'s size, not the source's.
        const outputDimensions = await decodeImage(blob);

        // If the user removed this item mid-flight, drop the result and don't leak URLs.
        if (!itemsRef.current.some((i) => i.id === id)) {
          URL.revokeObjectURL(previewUrl);
          return;
        }

        const outputUrl = URL.createObjectURL(blob);
        setItems((prev) =>
          updateItem(prev, id, {
            status: 'done',
            width: outputDimensions.width,
            height: outputDimensions.height,
            previewUrl,
            outputUrl,
            outputSize: blob.size,
            downloadName: filename,
            error: undefined,
          }),
        );
        revokeItemUrls(previous);
      } catch (caught) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (!itemsRef.current.some((i) => i.id === id)) return;
        const message =
          caught instanceof ImageDecodeError
            ? caught.message
            : 'This image could not be processed. It may be corrupt or an unsupported format.';
        setItems((prev) =>
          updateItem(prev, id, {
            status: 'error',
            error: message,
            previewUrl: undefined,
            outputUrl: undefined,
            outputSize: undefined,
          }),
        );
        revokeItemUrls(previous);
      }
    },
    [process, onFirstLoad, revokeItemUrls],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const accepted: string[] = [];

      const newItems: BatchItem[] = files.map((file) => {
        const id = nextId();
        const validation = validateImageFile(file);
        if (!validation.ok) {
          filesRef.current.set(id, file);
          return {
            id,
            fileName: file.name,
            fileSize: file.size,
            status: 'error' as const,
            error: validation.message ?? 'This file cannot be used.',
          };
        }
        filesRef.current.set(id, file);
        accepted.push(id);
        return { id, fileName: file.name, fileSize: file.size, status: 'processing' as const };
      });

      if (newItems.length === 0) return;
      setItems((prev) => [...prev, ...newItems]);
      for (const id of accepted) {
        void processItem(id);
      }
    },
    [nextId, processItem],
  );

  // Reprocess every loaded file when the tool's settings change (process's
  // identity changes only when the caller's memoized deps do; on mount the
  // queue is empty, so this is a no-op).
  useEffect(() => {
    for (const item of itemsRef.current) {
      if (filesRef.current.has(item.id)) void processItem(item.id);
    }
  }, [processItem]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = clipboardImageFiles(event.clipboardData);
      if (files.length > 0) {
        event.preventDefault();
        addFiles(files);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles]);

  const retryItem = useCallback((id: string) => void processItem(id), [processItem]);

  const removeOne = useCallback(
    (id: string) => {
      revokeItemUrls(itemsRef.current.find((i) => i.id === id));
      filesRef.current.delete(id);
      setItems((prev) => removeItem(prev, id));
    },
    [revokeItemUrls],
  );

  const clearAll = useCallback(() => {
    for (const item of itemsRef.current) revokeItemUrls(item);
    filesRef.current.clear();
    seededRef.current = false;
    setItems([]);
  }, [revokeItemUrls]);

  const downloadAll = useCallback(async () => {
    const done = itemsRef.current.filter((item) => item.status === 'done' && item.outputUrl);
    if (done.length === 0) return;

    setIsZipping(true);
    try {
      const entries = (
        await Promise.all(
          done.map(async (item): Promise<ZipEntry | null> => {
            const src = item.outputUrl;
            if (!src) return null;
            const buffer = await (await fetch(src)).arrayBuffer();
            return { name: item.downloadName ?? item.fileName, data: new Uint8Array(buffer) };
          }),
        )
      ).filter((entry): entry is ZipEntry => entry !== null);

      const bytes = buildZip(entries);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/zip' });
      const zipUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = zipUrl;
      anchor.download = zipName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
    } finally {
      setIsZipping(false);
    }
  }, [zipName]);

  const openPicker = () => inputRef.current?.click();
  const counts = batchCounts(items);
  const hasItems = items.length > 0;

  return (
    <section>
      <HiddenFileInput
        ref={inputRef}
        type="file"
        multiple
        accept={[...ACCEPTED_IMAGE_MIME, ...ACCEPTED_IMAGE_EXTENSIONS].join(',')}
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) addFiles(event.target.files);
          event.target.value = '';
        }}
        data-testid={`${testIdPrefix}-file-input`}
      />

      <Stack gap={4}>
        {!hasItems ? (
          <ImageDropzone
            active={isDragging}
            ariaLabel="Add images by choosing files, dropping them, or pasting"
            onClick={openPicker}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                addFiles(event.dataTransfer.files);
              }
            }}
            hint={dropzoneHint}
            testId={`${testIdPrefix}-dropzone`}
          />
        ) : null}

        {children({ count: items.length })}

        {hasItems ? (
          <>
            <StatusLine aria-live="polite" role="status" data-testid={`${testIdPrefix}-status`}>
              {counts.settled
                ? counts.done > 0
                  ? `${counts.done} image${counts.done === 1 ? '' : 's'} ready` +
                    (counts.errored > 0 ? ` · ${counts.errored} failed` : '')
                  : `${counts.errored} file${counts.errored === 1 ? '' : 's'} could not be used`
                : `Working… (${counts.done}/${counts.total})`}
            </StatusLine>

            <QueueList data-testid={`${testIdPrefix}-results`}>
              {items.map((item) => (
                <QueueItemRow key={item.id} tone={item.status === 'error' ? 'danger' : 'default'}>
                  {item.previewUrl ? (
                    <Thumb src={item.previewUrl} alt={`Preview of ${item.fileName}`} />
                  ) : (
                    <ThumbEmpty aria-hidden="true" />
                  )}

                  <QueueBody>
                    <QueueName title={item.fileName}>{item.fileName}</QueueName>

                    {item.status === 'processing' ? (
                      <Text tone="muted" size="sm">
                        Working…
                      </Text>
                    ) : null}

                    {item.status === 'error' ? (
                      <Text tone="danger" size="sm" data-testid="item-error">
                        {item.error}
                      </Text>
                    ) : null}

                    {item.status === 'done' ? (
                      <Text tone="muted" size="sm" numeric data-testid="item-meta">
                        {item.width}×{item.height} · {formatBytes(item.outputSize ?? item.fileSize)}
                      </Text>
                    ) : null}
                  </QueueBody>

                  <Stack direction="row" gap={2} wrap justify="flex-end">
                    {item.status === 'done' && item.outputUrl ? (
                      <DownloadLink
                        href={item.outputUrl}
                        download={item.downloadName}
                        variant="primary"
                        size="sm"
                        data-testid="item-download"
                      >
                        Download
                      </DownloadLink>
                    ) : null}
                    {item.status === 'error' ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => retryItem(item.id)}
                        data-testid="item-retry"
                      >
                        Retry
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${item.fileName}`}
                      onClick={() => removeOne(item.id)}
                      data-testid="item-remove"
                    >
                      Remove
                    </Button>
                  </Stack>
                </QueueItemRow>
              ))}
            </QueueList>

            <Stack direction="row" gap={2} wrap>
              {counts.done >= 2 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => void downloadAll()}
                  disabled={isZipping}
                  data-testid={`${testIdPrefix}-download-all`}
                >
                  {isZipping ? 'Preparing ZIP…' : 'Download all as ZIP'}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                onClick={openPicker}
                data-testid={`${testIdPrefix}-add-more`}
              >
                Add more
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={clearAll}
                data-testid={`${testIdPrefix}-clear`}
              >
                Clear all
              </Button>
            </Stack>

            <Text tone="muted" size="sm">
              Your images never leave your device. Processing runs entirely in your browser.
            </Text>
          </>
        ) : null}
      </Stack>
    </section>
  );
}
