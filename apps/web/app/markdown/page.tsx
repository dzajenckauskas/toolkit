import type { Metadata } from 'next';
import MarkdownEditor from '@/components/MarkdownEditor';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Markdown Editor & Preview — Free Tools',
  description: 'Write Markdown with a live preview in your browser. No account, no upload.',
};

export default function MarkdownPage() {
  return (
    <Page>
      <header>
        <Heading>Markdown Editor</Heading>
        <Text tone="muted">Write Markdown with a live preview, locally in your browser.</Text>
      </header>
      <MarkdownEditor />
    </Page>
  );
}
