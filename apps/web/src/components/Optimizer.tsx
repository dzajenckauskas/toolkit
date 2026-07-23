'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { validateFile } from '@/lib/validation';
import { generateOutputFilename } from '@/lib/filename';
import { formatBytes } from '@/lib/format';
import { calculateSavings, type SizeComparison } from '@/lib/savings';
import { ImageDecodeError, ImageEncodeError, optimizeJpeg } from '@/lib/optimize';
import { ACCEPTED_EXTENSIONS } from '@/lib/constants';

type Status = 'idle' | 'ready' | 'optimizing' | 'done' | 'error';

interface OriginalInfo {
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  previewUrl: string;
}

interface OptimizedInfo {
  downloadName: string;
  downloadUrl: string;
  sizeBytes: number;
  comparison: SizeComparison;
}

export default function Optimizer() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [original, setOriginal] = useState<OriginalInfo | null>(null);
  const [optimized, setOptimized] = useState<OptimizedInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Track every object URL we mint so we can revoke them precisely, both on
  // replacement and on unmount. (docs/ux: "clean up temporary resources".)
  const originalUrlRef = useRef<string | null>(null);
  const optimizedUrlRef = useRef<string | null>(null);

  const revokeOriginalUrl = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
  }, []);

  const revokeOptimizedUrl = useCallback(() => {
    if (optimizedUrlRef.current) {
      URL.revokeObjectURL(optimizedUrlRef.current);
      optimizedUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Revoke any outstanding URLs when the component unmounts.
    return () => {
      revokeOriginalUrl();
      revokeOptimizedUrl();
    };
  }, [revokeOriginalUrl, revokeOptimizedUrl]);

  const resetOutputs = useCallback(() => {
    revokeOriginalUrl();
    revokeOptimizedUrl();
    setOriginal(null);
    setOptimized(null);
  }, [revokeOriginalUrl, revokeOptimizedUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setOptimized(null);
      revokeOptimizedUrl();

      const validation = validateFile(file);
      if (!validation.ok) {
        resetOutputs();
        setStatus('error');
        setError(validation.message ?? 'This file cannot be used.');
        return;
      }

      try {
        // Show original info + preview, then optimize with the one default.
        setStatus('optimizing');
        const result = await optimizeJpeg(file);

        revokeOriginalUrl();
        const previewUrl = URL.createObjectURL(file);
        originalUrlRef.current = previewUrl;

        const downloadUrl = URL.createObjectURL(result.blob);
        optimizedUrlRef.current = downloadUrl;

        const comparison = calculateSavings(file.size, result.blob.size);

        setOriginal({
          name: file.name,
          sizeBytes: file.size,
          width: result.dimensions.width,
          height: result.dimensions.height,
          previewUrl,
        });
        setOptimized({
          downloadName: generateOutputFilename(file.name),
          downloadUrl,
          sizeBytes: result.blob.size,
          comparison,
        });
        setStatus('done');
      } catch (caught) {
        resetOutputs();
        setStatus('error');
        if (caught instanceof ImageDecodeError || caught instanceof ImageEncodeError) {
          setError(caught.message);
        } else {
          setError('Something went wrong while optimizing this image. Please try again.');
        }
      }
    },
    [resetOutputs, revokeOptimizedUrl, revokeOriginalUrl],
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        void handleFile(file);
      }
      // Allow re-selecting the same file to re-run.
      event.target.value = '';
    },
    [handleFile],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        void handleFile(file);
      }
    },
    [handleFile],
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const clearAll = useCallback(() => {
    resetOutputs();
    setError(null);
    setStatus('idle');
  }, [resetOutputs]);

  const isBusy = status === 'optimizing';

  return (
    <section className="optimizer" aria-labelledby="optimizer-heading">
      <input
        ref={inputRef}
        type="file"
        accept={`image/jpeg,${ACCEPTED_EXTENSIONS.join(',')}`}
        className="visually-hidden"
        onChange={onInputChange}
        data-testid="file-input"
      />

      <div
        className={`dropzone${isDragging ? ' dropzone--active' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Add a JPEG image by choosing a file or dropping it here"
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
        <p className="dropzone__lead">Drop a product photo here, or choose a JPEG.</p>
        <p className="dropzone__hint">One JPEG at a time. It is optimized in your browser.</p>
      </div>

      <div className="status" aria-live="polite" role="status" data-testid="status">
        {isBusy ? 'Optimizing your image…' : ''}
      </div>

      {status === 'error' && error ? (
        <p className="alert alert--error" role="alert" data-testid="error">
          {error}
        </p>
      ) : null}

      {original && optimized ? (
        <div className="results" data-testid="results">
          <figure className="preview">
            {/* Object-URL preview of the user's own local file; next/image is
                unnecessary and would try to optimize a blob URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={original.previewUrl} alt={`Preview of ${original.name}`} />
            <figcaption>{original.name}</figcaption>
          </figure>

          <dl className="details">
            <div>
              <dt>Format</dt>
              <dd>JPEG</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd data-testid="dimensions">
                {original.width} × {original.height} px
              </dd>
            </div>
            <div>
              <dt>Original size</dt>
              <dd data-testid="original-size">{formatBytes(original.sizeBytes)}</dd>
            </div>
            <div>
              <dt>Optimized size</dt>
              <dd data-testid="optimized-size">{formatBytes(optimized.sizeBytes)}</dd>
            </div>
            <div>
              <dt>Result</dt>
              <dd data-testid="savings">
                {optimized.comparison.isSmaller
                  ? `${optimized.comparison.savedPercent}% smaller`
                  : 'Already well optimized — no size reduction'}
              </dd>
            </div>
          </dl>

          <div className="actions">
            <a
              className="button button--primary"
              href={optimized.downloadUrl}
              download={optimized.downloadName}
              data-testid="download"
            >
              Download optimized JPEG
            </a>
            <button type="button" className="button button--ghost" onClick={clearAll}>
              Start over
            </button>
          </div>

          <p className="privacy">
            Your image never leaves your device. Optimization runs entirely in your browser.
          </p>
        </div>
      ) : null}
    </section>
  );
}
