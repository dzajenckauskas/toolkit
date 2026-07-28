'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { harmonies, shades, tints } from '@toolkit/lib/color-harmony';

const Controls = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(3),
  alignItems: 'center',
  flexWrap: 'wrap',
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

const Swatches = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(2),
  flexWrap: 'wrap',
}));

const Swatch = styled('button')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  padding: 0,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  overflow: 'hidden',
  cursor: 'pointer',
  background: theme.color.surface,
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

const Chip = styled('span')({ width: 72, height: 56, display: 'block' });

const Hex = styled('span')(({ theme }) => ({
  padding: '0.25rem 0.4rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.72rem',
  color: theme.color.text,
}));

const Group = ({ label, colors, prefix }: { label: string; colors: string[]; prefix: string }) => {
  const copy = (hex: string) => void navigator.clipboard?.writeText(hex).catch(() => {});
  return (
    <Stack gap={2}>
      <Text as="span" tone="muted" size="sm" weight={700}>
        {label}
      </Text>
      <Swatches data-testid={`palette-${prefix}`}>
        {colors.map((hex, i) => (
          <Swatch key={`${hex}-${i}`} type="button" onClick={() => copy(hex)} title={`Copy ${hex}`}>
            <Chip style={{ background: hex }} />
            <Hex>{hex}</Hex>
          </Swatch>
        ))}
      </Swatches>
    </Stack>
  );
};

export default function PaletteGenerator() {
  const [base, setBase] = useState('#3366cc');
  const result = useMemo(() => harmonies(base), [base]);

  return (
    <Stack gap={4}>
      <Controls>
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(base) ? base : '#3366cc'}
          onChange={(e) => setBase(e.target.value)}
          aria-label="Base color"
          data-testid="palette-picker"
        />
        <HexInput
          value={base}
          onChange={(e) => setBase(e.target.value)}
          aria-label="Base hex"
          data-testid="palette-hex"
        />
        <Text tone="muted" size="sm">
          Click a swatch to copy its hex.
        </Text>
      </Controls>

      {result ? (
        <Stack gap={4}>
          <Group label="Complementary" colors={result.complementary} prefix="complementary" />
          <Group label="Analogous" colors={result.analogous} prefix="analogous" />
          <Group label="Triadic" colors={result.triadic} prefix="triadic" />
          <Group label="Tetradic" colors={result.tetradic} prefix="tetradic" />
          <Group label="Monochromatic" colors={result.monochromatic} prefix="monochromatic" />
          <Group label="Tints" colors={tints(base)} prefix="tints" />
          <Group label="Shades" colors={shades(base)} prefix="shades" />
        </Stack>
      ) : (
        <Text tone="danger" size="sm" data-testid="palette-error">
          Enter a valid hex color, e.g. #3366cc.
        </Text>
      )}
    </Stack>
  );
}
