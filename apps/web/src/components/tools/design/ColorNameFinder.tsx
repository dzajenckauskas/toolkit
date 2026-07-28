'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { nearestColorName } from '@toolkit/lib/color-names';

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

const Result = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(3),
  alignItems: 'center',
  padding: theme.space(3),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
}));

const Big = styled('span')({ width: 64, height: 64, borderRadius: 10, display: 'block' });

export default function ColorNameFinder() {
  const [hex, setHex] = useState('#4682b4');
  const match = useMemo(() => nearestColorName(hex), [hex]);

  return (
    <Stack gap={4}>
      <Controls>
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#4682b4'}
          onChange={(e) => setHex(e.target.value)}
          aria-label="Pick a color"
          data-testid="cname-picker"
        />
        <HexInput
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          aria-label="Hex color"
          data-testid="cname-hex"
        />
      </Controls>

      {match ? (
        <Result>
          <Big style={{ background: match.hex }} />
          <Stack gap={1}>
            <Text weight={700} data-testid="cname-name">
              {match.name}
            </Text>
            <Text tone="muted" size="sm" data-testid="cname-detail">
              {match.exact ? 'Exact match' : 'Nearest named color'} · {match.hex}
              {match.exact ? '' : ` · distance ${Math.round(match.distance)}`}
            </Text>
          </Stack>
        </Result>
      ) : (
        <Text tone="danger" size="sm" data-testid="cname-error">
          Enter a valid hex color, e.g. #4682b4.
        </Text>
      )}

      <Text tone="muted" size="sm">
        Matched against the CSS named colors, in your browser.
      </Text>
    </Stack>
  );
}
