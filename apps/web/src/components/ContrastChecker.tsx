'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import { hexContrast } from '@toolkit/lib/contrast';

const Controls = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(4),
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

const HexInput = styled('input')(({ theme }) => ({
  width: '7rem',
  padding: '0.4rem 0.6rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: '8px',
}));

const Sample = styled('div')({
  padding: '2rem 1.5rem',
  borderRadius: '12px',
  textAlign: 'center',
});

const Badges = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: theme.space(2),
}));

const Badge = styled('div', {
  shouldForwardProp: (prop) => prop !== 'pass',
})<{ pass: boolean }>(({ theme, pass }) => ({
  padding: theme.space(2),
  borderRadius: theme.radius.md,
  textAlign: 'center',
  fontSize: '0.85rem',
  fontWeight: 700,
  border: `1px solid ${pass ? theme.color.accent : theme.color.dangerBorder}`,
  background: pass
    ? `color-mix(in srgb, ${theme.color.accent} 10%, transparent)`
    : theme.color.dangerBg,
  color: pass ? theme.color.text : theme.color.dangerText,
}));

export default function ContrastChecker() {
  const [fg, setFg] = useState('#1a1a1a');
  const [bg, setBg] = useState('#ffffff');

  const result = useMemo(() => hexContrast(fg, bg), [fg, bg]);

  return (
    <Stack gap={4}>
      <Controls>
        <Field>
          Text
          <input
            type="color"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            aria-label="Text color"
            data-testid="contrast-fg-picker"
          />
          <HexInput
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            aria-label="Text hex"
            data-testid="contrast-fg"
          />
        </Field>
        <Field>
          Background
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            aria-label="Background color"
            data-testid="contrast-bg-picker"
          />
          <HexInput
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            aria-label="Background hex"
            data-testid="contrast-bg"
          />
        </Field>
      </Controls>

      {result ? (
        <Stack gap={3}>
          <Sample style={{ color: fg, background: bg }}>
            <Text as="span" style={{ color: fg, fontSize: '1.4rem', fontWeight: 700 }}>
              The quick brown fox
            </Text>
          </Sample>
          <Text weight={700} numeric data-testid="contrast-ratio">
            Contrast ratio: {Math.round(result.ratio * 100) / 100}:1
          </Text>
          <Badges>
            <Badge pass={result.aaNormal} data-testid="contrast-aa-normal">
              AA normal {result.aaNormal ? '✓' : '✗'}
            </Badge>
            <Badge pass={result.aaLarge} data-testid="contrast-aa-large">
              AA large {result.aaLarge ? '✓' : '✗'}
            </Badge>
            <Badge pass={result.aaaNormal} data-testid="contrast-aaa-normal">
              AAA normal {result.aaaNormal ? '✓' : '✗'}
            </Badge>
            <Badge pass={result.aaaLarge} data-testid="contrast-aaa-large">
              AAA large {result.aaaLarge ? '✓' : '✗'}
            </Badge>
          </Badges>
        </Stack>
      ) : (
        <Text tone="danger" size="sm" data-testid="contrast-error">
          Enter two valid hex colors.
        </Text>
      )}
    </Stack>
  );
}
