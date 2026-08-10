'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { DownloadLink, InlineField as Field, Stack, Text } from '@toolkit/ui';
import { ERROR_LEVELS, type ErrorLevel, qrToDataUrl } from '@toolkit/lib/qr';

const Area = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '5rem',
  padding: theme.space(3),
  fontSize: '0.95rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

const Preview = styled('img')(({ theme }) => ({
  width: 256,
  height: 256,
  maxWidth: '100%',
  imageRendering: 'pixelated',
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.color.border}`,
  background: '#fff',
}));

export default function QrGenerator() {
  const [text, setText] = useState('https://example.com');
  const [level, setLevel] = useState<ErrorLevel>('M');
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!text) {
      setDataUrl('');
      setError('');
      return;
    }
    qrToDataUrl(text, { errorCorrectionLevel: level, width: 512 })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl('');
          setError('Could not encode that (it may be too long).');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [text, level]);

  return (
    <Stack gap={4}>
      <Area
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="URL or text to encode…"
        aria-label="Text to encode"
        data-testid="qr-input"
      />

      <Field>
        Error correction
        <select
          value={level}
          onChange={(event) => setLevel(event.target.value as ErrorLevel)}
          data-testid="qr-level"
        >
          {ERROR_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </Field>

      {error ? (
        <Text tone="danger" size="sm" data-testid="qr-error">
          {error}
        </Text>
      ) : dataUrl ? (
        <Stack gap={2} align="flex-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Preview src={dataUrl} alt="QR code" data-testid="qr-image" />
          <DownloadLink
            href={dataUrl}
            download="qr-code.png"
            variant="primary"
            data-testid="qr-download"
          >
            Download PNG
          </DownloadLink>
        </Stack>
      ) : null}

      <Text tone="muted" size="sm">
        Generated in your browser — nothing is uploaded.
      </Text>
    </Stack>
  );
}
