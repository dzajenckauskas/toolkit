'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { detectUnit, fromEpoch, relativeTime, toEpoch } from '@toolkit/lib/timestamp';

const Input = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.6rem 0.8rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const Panel = styled('div')(({ theme }) => ({
  padding: theme.space(4),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
}));

const Row = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '6rem minmax(0, 1fr)',
  gap: theme.space(2),
  padding: `${theme.space(1)} 0`,
}));

const Mono = styled('code')(({ theme }) => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  wordBreak: 'break-all',
  color: theme.color.text,
}));

export default function TimestampConverter() {
  const [now, setNow] = useState(() => Date.now());
  const [epochInput, setEpochInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const epochResult = useMemo(() => {
    const n = Number(epochInput);
    if (epochInput.trim() === '' || Number.isNaN(n)) return null;
    try {
      const unit = detectUnit(n);
      const parts = fromEpoch(n, unit);
      return { unit, parts, relative: relativeTime(parts.ms, now) };
    } catch {
      return 'error' as const;
    }
  }, [epochInput, now]);

  const dateResult = useMemo(() => {
    if (dateInput.trim() === '') return null;
    try {
      return toEpoch(dateInput);
    } catch {
      return 'error' as const;
    }
  }, [dateInput]);

  return (
    <Stack gap={4}>
      <Text tone="muted" size="sm" numeric data-testid="ts-now">
        Now: {Math.floor(now / 1000)} s · {now} ms
      </Text>

      <Stack gap={2}>
        <Text as="span" weight={600}>
          Timestamp → date
        </Text>
        <Input
          value={epochInput}
          onChange={(event) => setEpochInput(event.target.value)}
          placeholder="Unix timestamp (seconds or ms)…"
          aria-label="Unix timestamp"
          data-testid="ts-epoch-input"
        />
        {epochResult === 'error' ? (
          <Text tone="danger" size="sm" data-testid="ts-epoch-error">
            Not a valid timestamp.
          </Text>
        ) : epochResult ? (
          <Panel data-testid="ts-epoch-result">
            <Row>
              <Text as="span" tone="muted" size="sm" weight={700}>
                Detected
              </Text>
              <Mono>{epochResult.unit}</Mono>
            </Row>
            <Row>
              <Text as="span" tone="muted" size="sm" weight={700}>
                ISO
              </Text>
              <Mono data-testid="ts-iso">{epochResult.parts.iso}</Mono>
            </Row>
            <Row>
              <Text as="span" tone="muted" size="sm" weight={700}>
                UTC
              </Text>
              <Mono>{epochResult.parts.utc}</Mono>
            </Row>
            <Row>
              <Text as="span" tone="muted" size="sm" weight={700}>
                Local
              </Text>
              <Mono>{epochResult.parts.local}</Mono>
            </Row>
            <Row>
              <Text as="span" tone="muted" size="sm" weight={700}>
                Relative
              </Text>
              <Mono>{epochResult.relative}</Mono>
            </Row>
          </Panel>
        ) : null}
      </Stack>

      <Stack gap={2}>
        <Text as="span" weight={600}>
          Date → timestamp
        </Text>
        <Input
          value={dateInput}
          onChange={(event) => setDateInput(event.target.value)}
          placeholder="e.g. 2024-01-31 or an ISO date…"
          aria-label="Date string"
          data-testid="ts-date-input"
        />
        {dateResult === 'error' ? (
          <Text tone="danger" size="sm" data-testid="ts-date-error">
            Could not parse that date.
          </Text>
        ) : dateResult ? (
          <Panel>
            <Row>
              <Text as="span" tone="muted" size="sm" weight={700}>
                Seconds
              </Text>
              <Mono data-testid="ts-date-seconds">{dateResult.seconds}</Mono>
            </Row>
            <Row>
              <Text as="span" tone="muted" size="sm" weight={700}>
                Millis
              </Text>
              <Mono>{dateResult.ms}</Mono>
            </Row>
          </Panel>
        ) : null}
      </Stack>
    </Stack>
  );
}
