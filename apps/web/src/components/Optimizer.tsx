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

export default function Optimizer() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [quality, setQuality] = useState<QualityLevel>(DEFAULT_QUALITY_LEVEL);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  // Source files by item id, kept so we can re-optimize (quality change) or retry.
  const filesRef = useRef<Map<string, File>>(new Map());
  // Latest items, for reading previous object URLs and for unmount cleanup.
  const itemsRef = useRef<QueueItem[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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

  const onQualityChange = useCallback(
    (level: QualityLevel) => {
      setQuality(level);
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

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        addFiles(event.target.files);
      }
      event.target.value = ''; // allow re-selecting the same files
    },
    [addFiles],
  );

  const onDrop = useCallback(
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
    <section className="optimizer" aria-labelledby="optimizer-heading">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={`image/jpeg,${ACCEPTED_EXTENSIONS.join(',')}`}
        className="visually-hidden"
        onChange={onInputChange}
        data-testid="file-input"
      />

      <div
        className={`dropzone${isDragging ? ' dropzone--active' : ''}`}
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
        onDrop={onDrop}
        data-testid="dropzone"
      >
        <p className="dropzone__lead">Drop product photos here, or choose JPEGs.</p>
        <p className="dropzone__hint">Add one or many. They are optimized in your browser.</p>
      </div>

      <fieldset className="quality" data-testid="quality" disabled={!summary.settled}>
        <legend>Compression level</legend>
        <div className="quality__options">
          {QUALITY_LEVELS.map((level) => (
            <label key={level} className="quality__option">
              <input
                type="radio"
                name="quality"
                value={level}
                checked={quality === level}
                onChange={() => onQualityChange(level)}
                data-testid={`quality-${level}`}
              />
              <span className="quality__text">
                <span className="quality__label">{qualityLabel(level)}</span>
                <span className="quality__hint">{qualityHint(level)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="status" aria-live="polite" role="status" data-testid="status">
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
      </div>

      {hasItems ? (
        <>
          <ul className="queue" data-testid="results">
            {items.map((item) => (
              <li key={item.id} className={`queue__item queue__item--${item.status}`}>
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="queue__thumb"
                    src={item.previewUrl}
                    alt={`Preview of ${item.fileName}`}
                  />
                ) : (
                  <div className="queue__thumb queue__thumb--empty" aria-hidden="true" />
                )}

                <div className="queue__body">
                  <p className="queue__name" title={item.fileName}>
                    {item.fileName}
                  </p>

                  {item.status === 'optimizing' ? <p className="queue__meta">Optimizing…</p> : null}

                  {item.status === 'error' ? (
                    <p className="queue__meta queue__meta--error" data-testid="item-error">
                      {item.error}
                    </p>
                  ) : null}

                  {item.status === 'done' ? (
                    <p className="queue__meta" data-testid="item-meta">
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
                    </p>
                  ) : null}
                </div>

                <div className="queue__actions">
                  {item.status === 'done' && item.optimizedUrl ? (
                    <a
                      className="button button--primary button--small"
                      href={item.optimizedUrl}
                      download={item.downloadName}
                      data-testid="item-download"
                    >
                      Download
                    </a>
                  ) : null}
                  {item.status === 'error' ? (
                    <button
                      type="button"
                      className="button button--ghost button--small"
                      onClick={() => retryItem(item.id)}
                    >
                      Retry
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    aria-label={`Remove ${item.fileName}`}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="actions">
            <button type="button" className="button button--ghost" onClick={clearAll}>
              Clear all
            </button>
          </div>

          <p className="privacy">
            Your images never leave your device. Optimization runs entirely in your browser.
          </p>
        </>
      ) : null}
    </section>
  );
}
