'use client';

import styled from '@emotion/styled';
import { toolBadge, type Tool, type ToolBadgeKind } from '@toolkit/tools/registry';

/**
 * The single status badge on a tool card or search row. Three mutually
 * exclusive kinds, resolved by `toolBadge` in the registry:
 *   - "Soon" — planned, not yet live (grey outline)
 *   - "New"  — live and inside its launch window (filled accent, loudest)
 *   - "Top"  — curated flagship (accent-tinted outline)
 * Renders nothing when the tool earns no badge.
 */

const LABELS: Record<ToolBadgeKind, string> = { soon: 'Soon', new: 'New', top: 'Top' };

const Badge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'kind',
})<{ kind: ToolBadgeKind }>(({ theme, kind }) => ({
  flex: '0 0 auto',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  borderRadius: theme.radius.pill,
  padding: '0.1rem 0.5rem',
  border: '1px solid transparent',
  ...(kind === 'soon' && {
    color: theme.color.muted,
    borderColor: theme.color.border,
  }),
  ...(kind === 'new' && {
    color: theme.color.accentContrast,
    background: theme.color.accent,
    borderColor: theme.color.accent,
  }),
  ...(kind === 'top' && {
    color: theme.color.accentStrong,
    background: `color-mix(in srgb, ${theme.color.accent} 12%, transparent)`,
    borderColor: `color-mix(in srgb, ${theme.color.accent} 30%, transparent)`,
  }),
}));

export function ToolBadge({ tool }: { tool: Tool }) {
  const kind = toolBadge(tool);
  if (!kind) return null;
  return (
    <Badge kind={kind} data-testid={`badge-${kind}`}>
      {LABELS[kind]}
    </Badge>
  );
}
