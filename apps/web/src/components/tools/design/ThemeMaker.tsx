'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@toolkit/ui';
import { buildTheme, themeToCss, type Theme } from '@toolkit/lib/theme-maker';

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

const Previews = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  gap: theme.space(3),
}));

const Code = styled('pre')(({ theme }) => ({
  margin: 0,
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.82rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  overflowX: 'auto',
}));

function Mockup({ theme, label, testid }: { theme: Theme; label: string; testid: string }) {
  return (
    <div
      data-testid={testid}
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 16,
        color: theme.text,
      }}
    >
      <div style={{ fontSize: '0.75rem', color: theme.muted, marginBottom: 8 }}>{label}</div>
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: 12,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Card title</div>
        <div style={{ color: theme.muted, fontSize: '0.85rem', marginBottom: 12 }}>
          Muted supporting text.
        </div>
        <span
          style={{
            display: 'inline-block',
            background: theme.accent,
            color: theme.accentContrast,
            padding: '6px 12px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          Accent button
        </span>
      </div>
    </div>
  );
}

export default function ThemeMaker() {
  const [accent, setAccent] = useState('#3366cc');
  const [copied, setCopied] = useState(false);

  const light = useMemo(() => buildTheme(accent, 'light'), [accent]);
  const dark = useMemo(() => buildTheme(accent, 'dark'), [accent]);
  const css = useMemo(() => themeToCss(light, dark), [light, dark]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Stack gap={4}>
      <Controls>
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(accent) ? accent : '#3366cc'}
          onChange={(e) => {
            setAccent(e.target.value);
            setCopied(false);
          }}
          aria-label="Accent color"
          data-testid="theme-accent-picker"
        />
        <HexInput
          value={accent}
          onChange={(e) => {
            setAccent(e.target.value);
            setCopied(false);
          }}
          aria-label="Accent hex"
          data-testid="theme-accent"
        />
        <Text tone="muted" size="sm">
          Pick an accent — the neutral scale and both light/dark modes come from it.
        </Text>
      </Controls>

      <Previews>
        <Mockup theme={light} label="Light" testid="theme-light" />
        <Mockup theme={dark} label="Dark" testid="theme-dark" />
      </Previews>

      <Stack direction="row" gap={2} align="center" wrap>
        <Text as="span" tone="muted" size="sm" weight={600}>
          CSS variables
        </Text>
        <Button type="button" variant="ghost" onClick={() => void copy()} data-testid="theme-copy">
          {copied ? 'Copied' : 'Copy CSS'}
        </Button>
      </Stack>
      <Code data-testid="theme-css">{css}</Code>
    </Stack>
  );
}
