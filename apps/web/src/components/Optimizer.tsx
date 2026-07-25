'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { validateFile } from '@/lib/validation';
import { generateOutputFilename } from '@/lib/filename';
import { formatBytes } from '@/lib/format';
import { ImageDecodeError, ImageEncodeError, optimizeJpeg } from '@/lib/optimize';
import { ACCEPTED_EXTENSIONS } from '@/lib/constants';
import {
  DEFAULT_QUALITY_LEVEL,
  QUALITY_LEVELS,
  qualityHint,
  qualityLabel,
  qualityValue,
  type QualityLevel,
} from '@/lib/quality';
import {
  batchSummary,
  removeItem as removeQueueItem,
  updateItem,
  type QueueItem,
} from '@/lib/queue';
import { calculateSavings } from '@/lib/savings';
import { loadQualityLevel, saveQualityLevel } from '@/lib/settings';
import { buildZip, type ZipEntry } from '@/lib/zip';
import { clipboardImageFiles } from '@/lib/clipboard';
import styled from '@emotion/styled';
import { Button, DownloadLink, Stack, Text } from '@/components/ui';

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

const QualityFieldset = styled('fieldset')(({ theme }) => ({
  margin: 0,
  padding: theme.space(4),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  '&:disabled': { opacity: 0.6 },
  '& legend': {
    padding: `0 ${theme.space(1)}`,
    fontSize: '0.85rem',
    fontWeight: 600,
    color: theme.color.muted,
  },
}));

const QualityOptions = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(2),
}));

const QualityOption = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
  flex: '1 1 8rem',
  minWidth: '8rem',
  padding: '0.6rem 0.75rem',
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: '8px',
  cursor: 'pointer',
  '&:focus-within': {
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
  '&:has(input:checked)': {
    borderColor: theme.color.accent,
    background: `color-mix(in srgb, ${theme.color.accent} 8%, ${theme.color.surface})`,
  },
  '& input': {
    width: '1.1rem',
    height: '1.1rem',
    accentColor: theme.color.accent,
    flex: 'none',
  },
}));

const OptionText = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  lineHeight: 1.2,
});

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

export default function Optimizer() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [quality, setQuality] = useState<QualityLevel>(DEFAULT_QUALITY_LEVEL);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  // Source files by item id, kept so we can re-optimize (quality change) or retry.
  const filesRef = useRef<Map<string, File>>(new Map());
  // Latest items, for reading previous object URLs and for unmount cleanup.
  const itemsRef = useRef<QueueItem[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    // Restore the last-used quality on mount (client-only, so no hydration
    // mismatch). No files exist yet, so this triggers no re-optimization.
    setQuality(loadQualityLevel());
  }, []);

  const revokeItemUrls = useCallback((item: QueueItem | undefined) => {
    if (!item) return;
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.optimizedUrl) URL.revokeObjectURL(item.optimizedUrl);
  }, []);

  useEffect(() => {
    // Release every outstanding object URL when the component unmounts.
    return () => {
      for (const item of itemsRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.optimizedUrl) URL.revokeObjectURL(item.optimizedUrl);
      }
    };
  }, []);

  const nextId = useCallback(() => {
    idCounter.current += 1;
    return `item-${idCounter.current}`;
  }, []);

  // Optimize a single item's source file at the given quality and publish the
  // result. Mints new object URLs, then revokes the item's previous ones, so a
  // visible download never points at a revoked URL.
  const optimizeItem = useCallback(
    async (id: string, level: QualityLevel) => {
      const file = filesRef.current.get(id);
      if (!file) return;

      const previous = itemsRef.current.find((i) => i.id === id);
      setItems((prev) => updateItem(prev, id, { status: 'optimizing', error: undefined }));

      try {
        const result = await optimizeJpeg(file, qualityValue(level));

        // If the user removed this item mid-flight, drop the result and don't leak URLs.
        if (!itemsRef.current.some((i) => i.id === id)) return;

        const previewUrl = URL.createObjectURL(file);
        const optimizedUrl = URL.createObjectURL(result.blob);

        setItems((prev) =>
          updateItem(prev, id, {
            status: 'done',
            width: result.dimensions.width,
            height: result.dimensions.height,
            previewUrl,
            optimizedUrl,
            optimizedSize: result.blob.size,
            downloadName: generateOutputFilename(file.name),
            error: undefined,
          }),
        );

        revokeItemUrls(previous);
      } catch (caught) {
        if (!itemsRef.current.some((i) => i.id === id)) return;
        const message =
          caught instanceof ImageDecodeError || caught instanceof ImageEncodeError
            ? caught.message
            : 'Something went wrong while optimizing this image. Please try again.';
        setItems((prev) =>
          updateItem(prev, id, {
            status: 'error',
            error: message,
            previewUrl: undefined,
            optimizedUrl: undefined,
            optimizedSize: undefined,
          }),
        );
        revokeItemUrls(previous);
      }
    },
    [revokeItemUrls],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const accepted: string[] = [];

      const newItems: QueueItem[] = files.map((file) => {
        const id = nextId();
        const validation = validateFile(file);
        if (!validation.ok) {
          // Keep the file so the user can retry, but surface the error now.
          filesRef.current.set(id, file);
          return {
            id,
            fileName: file.name,
            fileSize: file.size,
            status: 'error',
            error: validation.message ?? 'This file cannot be used.',
          };
        }
        filesRef.current.set(id, file);
        accepted.push(id);
        return { id, fileName: file.name, fileSize: file.size, status: 'optimizing' };
      });

      if (newItems.length === 0) return;
      setItems((prev) => [...prev, ...newItems]);
      // Kick off optimization for the valid ones at the current quality.
      for (const id of accepted) {
        void optimizeItem(id, quality);
      }
    },
    [nextId, optimizeItem, quality],
  );

  useEffect(() => {
    // Paste an image anywhere on the page to add it (Cmd/Ctrl+V).
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

  const handleQualityChange = useCallback(
    (level: QualityLevel) => {
      setQuality(level);
      saveQualityLevel(level); // remember the choice for next time
      // Re-optimize everything that has a source file so results reflect the choice.
      for (const item of itemsRef.current) {
        if (filesRef.current.has(item.id)) {
          void optimizeItem(item.id, level);
        }
      }
    },
    [optimizeItem],
  );

  const retryItem = useCallback(
    (id: string) => {
      void optimizeItem(id, quality);
    },
    [optimizeItem, quality],
  );

  const removeItem = useCallback(
    (id: string) => {
      revokeItemUrls(itemsRef.current.find((i) => i.id === id));
      filesRef.current.delete(id);
      setItems((prev) => removeQueueItem(prev, id));
    },
    [revokeItemUrls],
  );

  const clearAll = useCallback(() => {
    for (const item of itemsRef.current) revokeItemUrls(item);
    filesRef.current.clear();
    setItems([]);
  }, [revokeItemUrls]);

  const handleDownloadAll = useCallback(async () => {
    const done = itemsRef.current.filter((item) => item.status === 'done' && item.optimizedUrl);
    if (done.length === 0) return;

    setIsZipping(true);
    try {
      const entries = (
        await Promise.all(
          done.map(async (item): Promise<ZipEntry | null> => {
            const src = item.optimizedUrl;
            if (!src) return null;
            const buffer = await (await fetch(src)).arrayBuffer();
            return { name: item.downloadName ?? item.fileName, data: new Uint8Array(buffer) };
          }),
        )
      ).filter((entry): entry is ZipEntry => entry !== null);

      const bytes = buildZip(entries);
      // fflate returns a Uint8Array that owns its buffer exactly; using .buffer
      // satisfies the stricter BlobPart typing (a plain ArrayBuffer at runtime).
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/zip' });
      const zipUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = zipUrl;
      anchor.download = 'optimized-images.zip';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Keep the URL alive briefly so the download can start, then release it.
      window.setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
    } finally {
      setIsZipping(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        addFiles(event.target.files);
      }
      event.target.value = ''; // allow re-selecting the same files
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        addFiles(event.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const summary = batchSummary(items);
  const hasItems = items.length > 0;

  return (
    <section aria-labelledby="tool-heading">
      <HiddenFileInput
        ref={inputRef}
        type="file"
        multiple
        accept={`image/jpeg,${ACCEPTED_EXTENSIONS.join(',')}`}
        onChange={handleInputChange}
        data-testid="file-input"
      />

      <Stack gap={4}>
        <Dropzone
          active={isDragging}
          role="button"
          tabIndex={0}
          aria-label="Add JPEG images by choosing files or dropping them here"
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
          onDrop={handleDrop}
          data-testid="dropzone"
        >
          <Text weight={600}>Drop product photos here, paste, or choose JPEGs.</Text>
          <Text tone="muted" size="sm">
            Add one or many, or paste with Cmd/Ctrl+V. They are optimized in your browser.
          </Text>
        </Dropzone>

        <QualityFieldset data-testid="quality" disabled={!summary.settled}>
          <legend>Compression level</legend>
          <QualityOptions>
            {QUALITY_LEVELS.map((level) => (
              <QualityOption key={level}>
                <input
                  type="radio"
                  name="quality"
                  value={level}
                  checked={quality === level}
                  onChange={() => handleQualityChange(level)}
                  data-testid={`quality-${level}`}
                />
                <OptionText>
                  <Text as="span" weight={600}>
                    {qualityLabel(level)}
                  </Text>
                  <Text as="span" tone="muted" size="sm">
                    {qualityHint(level)}
                  </Text>
                </OptionText>
              </QualityOption>
            ))}
          </QualityOptions>
        </QualityFieldset>

        <StatusLine aria-live="polite" role="status" data-testid="status">
          {hasItems
            ? summary.settled
              ? summary.done > 0
                ? `${summary.done} image${summary.done === 1 ? '' : 's'} optimized` +
                  (summary.totalSavedPercent > 0
                    ? ` · ${summary.totalSavedPercent}% smaller overall`
                    : '') +
                  (summary.errored > 0 ? ` · ${summary.errored} failed` : '')
                : `${summary.errored} file${summary.errored === 1 ? '' : 's'} could not be used`
              : `Optimizing… (${summary.done}/${summary.total})`
            : ''}
        </StatusLine>

        {hasItems ? (
          <>
            <QueueList data-testid="results">
              {items.map((item) => (
                <QueueItemRow key={item.id} tone={item.status === 'error' ? 'danger' : 'default'}>
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <Thumb src={item.previewUrl} alt={`Preview of ${item.fileName}`} />
                  ) : (
                    <ThumbEmpty aria-hidden="true" />
                  )}

                  <QueueBody>
                    <QueueName title={item.fileName}>{item.fileName}</QueueName>

                    {item.status === 'optimizing' ? (
                      <Text tone="muted" size="sm">
                        Optimizing…
                      </Text>
                    ) : null}

                    {item.status === 'error' ? (
                      <Text tone="danger" size="sm" data-testid="item-error">
                        {item.error}
                      </Text>
                    ) : null}

                    {item.status === 'done' ? (
                      <Text tone="muted" size="sm" numeric data-testid="item-meta">
                        {item.width}×{item.height} ·{' '}
                        <span data-testid="item-original">{formatBytes(item.fileSize)}</span> →{' '}
                        <span data-testid="item-optimized">
                          {formatBytes(item.optimizedSize ?? item.fileSize)}
                        </span>{' '}
                        ·{' '}
                        <span data-testid="item-savings">
                          {calculateSavings(item.fileSize, item.optimizedSize ?? item.fileSize)
                            .isSmaller
                            ? `${calculateSavings(item.fileSize, item.optimizedSize ?? item.fileSize).savedPercent}% smaller`
                            : 'already optimized'}
                        </span>
                      </Text>
                    ) : null}
                  </QueueBody>

                  <Stack direction="row" gap={2} wrap justify="flex-end">
                    {item.status === 'done' && item.optimizedUrl ? (
                      <DownloadLink
                        href={item.optimizedUrl}
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
                      >
                        Retry
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${item.fileName}`}
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </QueueItemRow>
              ))}
            </QueueList>

            <Stack direction="row" gap={2} wrap>
              {summary.done >= 2 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => void handleDownloadAll()}
                  disabled={isZipping}
                  data-testid="download-all"
                >
                  {isZipping ? 'Preparing ZIP…' : 'Download all as ZIP'}
                </Button>
              ) : null}
              <Button type="button" variant="ghost" onClick={clearAll}>
                Clear all
              </Button>
            </Stack>

            <Text tone="muted" size="sm">
              Your images never leave your device. Optimization runs entirely in your browser.
            </Text>
          </>
        ) : null}
      </Stack>
    </section>
  );
}
