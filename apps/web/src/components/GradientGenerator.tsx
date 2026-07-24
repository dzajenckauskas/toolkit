'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@/components/ui';
import { gradientCss, type GradientStop, type GradientType } from '@/lib/gradient';

const Preview = styled('div')(({ theme }) => ({
  height: '12rem',
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.color.border}`,
}));

const Row = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(3),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(2),
  fontSize: '0.9rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

const Code = styled('code')(({ theme }) => ({
  display: 'block',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  wordBreak: 'break-all',
}));

export default function GradientGenerator() {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#3366cc', position: 0 },
    { color: '#cc33aa', position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => gradientCss(type, angle, stops), [type, angle, stops]);

  const setStop = (i: number, patch: Partial<GradientStop>) =>
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const addStop = () => setStops((prev) => [...prev, { color: '#ffffff', position: 50 }]);
  const removeStop = (i: number) =>
    setStops((prev) => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`background: ${css};`);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Stack gap={4}>
      <Preview style={{ background: css }} data-testid="gradient-preview" />

      <Row>
        <Field>
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as GradientType)}
            data-testid="gradient-type"
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </Field>
        {type === 'linear' ? (
          <Field>
            Angle {angle}°
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              data-testid="gradient-angle"
            />
          </Field>
        ) : null}
        <Button type="button" variant="ghost" onClick={addStop} data-testid="gradient-add">
          Add stop
        </Button>
      </Row>

      <Stack gap={2}>
        {stops.map((stop, i) => (
          <Row key={i}>
            <input
              type="color"
              value={stop.color}
              onChange={(e) => setStop(i, { color: e.target.value })}
              aria-label={`Stop ${i + 1} color`}
              data-testid={`gradient-stop-color-${i}`}
            />
            <Field>
              Position
              <input
                type="range"
                min={0}
                max={100}
                value={stop.position}
                onChange={(e) => setStop(i, { position: Number(e.target.value) })}
                data-testid={`gradient-stop-pos-${i}`}
              />
              {stop.position}%
            </Field>
            {stops.length > 2 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeStop(i)}
                data-testid={`gradient-remove-${i}`}
              >
                Remove
              </Button>
            ) : null}
          </Row>
        ))}
      </Stack>

      <Stack direction="row" gap={2} align="center" wrap>
        <Text as="span" tone="muted" size="sm" weight={600}>
          CSS
        </Text>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void copy()}
          data-testid="gradient-copy"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Stack>
      <Code data-testid="gradient-css">background: {css};</Code>
    </Stack>
  );
}
