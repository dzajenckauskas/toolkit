'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { InlineField as Field, Stack, Text } from '@toolkit/ui';
import { blendSteps, mixHex } from '@toolkit/lib/color-harmony';

const Row = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(4),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const Strip = styled('div')(({ theme }) => ({
  display: 'flex',
  borderRadius: theme.radius.md,
  overflow: 'hidden',
  border: `1px solid ${theme.color.border}`,
}));

const Cell = styled('button')({
  flex: 1,
  minWidth: 0,
  height: 72,
  border: 'none',
  padding: 0,
  cursor: 'pointer',
});

export default function ColorMixer() {
  const [a, setA] = useState('#3366cc');
  const [b, setB] = useState('#cc9933');
  const [steps, setSteps] = useState(7);

  const blend = useMemo(() => blendSteps(a, b, steps), [a, b, steps]);
  const middle = useMemo(() => mixHex(a, b, 0.5), [a, b]);

  const copy = (hex: string) => void navigator.clipboard?.writeText(hex).catch(() => {});

  return (
    <Stack gap={4}>
      <Row>
        <Field>
          A
          <input
            type="color"
            value={a}
            onChange={(e) => setA(e.target.value)}
            aria-label="Color A"
            data-testid="mix-a"
          />
        </Field>
        <Field>
          B
          <input
            type="color"
            value={b}
            onChange={(e) => setB(e.target.value)}
            aria-label="Color B"
            data-testid="mix-b"
          />
        </Field>
        <Field>
          Steps {steps}
          <input
            type="range"
            min={3}
            max={11}
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            data-testid="mix-steps"
          />
        </Field>
      </Row>

      <Strip data-testid="mix-strip">
        {blend.map((hex, i) => (
          <Cell
            key={`${hex}-${i}`}
            style={{ background: hex }}
            onClick={() => copy(hex)}
            title={`Copy ${hex}`}
          />
        ))}
      </Strip>

      <Text weight={700} numeric data-testid="mix-middle">
        50/50 mix: {middle ?? '—'}
      </Text>
      <Text tone="muted" size="sm">
        Click any band to copy its hex. Blended in your browser.
      </Text>
    </Stack>
  );
}
