'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { VISION_LABELS, VISION_TYPES, simulateHex } from '@/lib/color-vision';

const Controls = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(2),
  flexWrap: 'wrap',
  alignItems: 'center',
}));

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.space(3),
}));

const RowLabel = styled('div')(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 700,
  color: theme.color.muted,
  marginBottom: theme.space(1),
}));

const Swatches = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(1),
  flexWrap: 'wrap',
}));

const Chip = styled('span')(({ theme }) => ({
  width: 64,
  height: 44,
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.color.border}`,
}));

const DEFAULT_COLORS = ['#e53935', '#43a047', '#1e88e5', '#fdd835', '#8e24aa'];

export default function ColorBlindnessSimulator() {
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);

  const setColor = (i: number, value: string) =>
    setColors((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  const addColor = () => setColors((prev) => [...prev, '#888888']);
  const removeColor = (i: number) =>
    setColors((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const rows = useMemo(
    () =>
      VISION_TYPES.map((type) => ({
        type,
        colors: colors.map((hex) => simulateHex(hex, type) ?? '#000000'),
      })),
    [colors],
  );

  return (
    <Stack gap={4}>
      <Controls>
        {colors.map((color, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(i, e.target.value)}
              aria-label={`Color ${i + 1}`}
              data-testid={`cvd-input-${i}`}
            />
            {colors.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeColor(i)}
                data-testid={`cvd-remove-${i}`}
              >
                ×
              </Button>
            ) : null}
          </span>
        ))}
        <Button type="button" variant="ghost" onClick={addColor} data-testid="cvd-add">
          Add color
        </Button>
      </Controls>

      <Grid>
        {rows.map((row) => (
          <div key={row.type} data-testid={`cvd-row-${row.type}`}>
            <RowLabel>{VISION_LABELS[row.type]}</RowLabel>
            <Swatches>
              {row.colors.map((hex, i) => (
                <Chip
                  key={i}
                  style={{ background: hex }}
                  title={hex}
                  data-testid={`cvd-${row.type}-${i}`}
                />
              ))}
            </Swatches>
          </div>
        ))}
      </Grid>

      <Text tone="muted" size="sm">
        Approximate simulation (Viénot/Brettel matrices), computed in your browser. If two swatches
        look identical in a row, that pair may be hard to tell apart for that vision type.
      </Text>
    </Stack>
  );
}
