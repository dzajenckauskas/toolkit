'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack } from '@toolkit/ui';
import { renderMarkdown } from '@toolkit/lib/markdown';

const Split = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: theme.space(3),
}));

const Editor = styled('textarea')(({ theme }) => ({
  width: '100%',
  minHeight: '24rem',
  padding: theme.space(3),
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.9rem',
  lineHeight: 1.6,
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  resize: 'vertical',
}));

const Preview = styled('div')(({ theme }) => ({
  minHeight: '24rem',
  padding: theme.space(3),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  color: theme.color.text,
  overflowWrap: 'break-word',
  '& h1, & h2, & h3': { marginTop: '0.6em', marginBottom: '0.3em', lineHeight: 1.25 },
  '& p': { margin: '0.5em 0' },
  '& pre': {
    padding: theme.space(3),
    background: theme.color.bg,
    borderRadius: theme.radius.sm,
    overflowX: 'auto',
  },
  '& code': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.85em' },
  '& blockquote': {
    margin: '0.5em 0',
    paddingLeft: theme.space(3),
    borderLeft: `3px solid ${theme.color.border}`,
    color: theme.color.muted,
  },
  '& a': { color: theme.color.accent },
  '& table': { borderCollapse: 'collapse' },
  '& th, & td': { border: `1px solid ${theme.color.border}`, padding: '0.3em 0.6em' },
  '& img': { maxWidth: '100%' },
}));

const SAMPLE = `# Hello, Markdown

Type on the **left**, see the preview on the **right**.

- Lists
- [Links](https://example.com)
- \`inline code\`

> Blockquotes too.
`;

export default function MarkdownEditor() {
  const [source, setSource] = useState(SAMPLE);
  const html = useMemo(() => renderMarkdown(source), [source]);

  return (
    <Stack gap={3}>
      <Split>
        <Editor
          value={source}
          onChange={(event) => setSource(event.target.value)}
          aria-label="Markdown source"
          data-testid="md-input"
          spellCheck={false}
        />
        <Preview
          data-testid="md-preview"
          // Safe: markdown-it is configured with html:false, so user input
          // cannot inject raw markup (see src/lib/markdown.ts).
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Split>
    </Stack>
  );
}
