'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { formatHsl, formatRgb, parseHex, rgbToHex, rgbToHsl } from '@/lib/color';

const Controls = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(3),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const Swatch = styled('div')(({ theme }) => ({
  width: '4rem',
  height: '4rem',
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.color.borderStrong}`,
}));

const HexInput = styled('input')(({ theme }) => ({
  width: '8rem',
  padding: '0.5rem 0.7rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const Row = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '4rem 1fr',
  gap: theme.space(2),
  alignItems: 'baseline',
  padding: `${theme.space(1)} 0`,
}));

const Value = styled('code')(({ theme }) => ({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.95rem',
  color: theme.color.text,
}));

export default function ColorConverter() {
  const [hex, setHex] = useState('#3366cc');

  const rgb = useMemo(() => parseHex(hex), [hex]);

  return (
    <Stack gap={4}>
      <Controls>
        <Swatch
          style={{ background: rgb ? rgbToHex(rgb) : 'transparent' }}
          data-testid="color-swatch"
        />
        <input
          type="color"
          value={rgb ? rgbToHex(rgb) : '#000000'}
          onChange={(event) => setHex(event.target.value)}
          aria-label="Pick a color"
          data-testid="color-picker"
        />
        <HexInput
          value={hex}
          onChange={(event) => setHex(event.target.value)}
          placeholder="#3366cc"
          aria-label="Hex color"
          data-testid="color-hex"
        />
      </Controls>

      {rgb ? (
        <div>
          <Row>
            <Text as="span" tone="muted" size="sm" weight={700}>
              HEX
            </Text>
            <Value data-testid="color-out-hex">{rgbToHex(rgb)}</Value>
          </Row>
          <Row>
            <Text as="span" tone="muted" size="sm" weight={700}>
              RGB
            </Text>
            <Value data-testid="color-out-rgb">{formatRgb(rgb)}</Value>
          </Row>
          <Row>
            <Text as="span" tone="muted" size="sm" weight={700}>
              HSL
            </Text>
            <Value data-testid="color-out-hsl">{formatHsl(rgbToHsl(rgb))}</Value>
          </Row>
        </div>
      ) : (
        <Text tone="danger" size="sm" data-testid="color-error">
          Enter a valid hex color, e.g. #3366cc or #36c.
        </Text>
      )}
    </Stack>
  );
}
