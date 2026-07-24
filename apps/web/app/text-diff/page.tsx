import type { Metadata } from 'next';
import TextDiff from '@/components/TextDiff';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Text Diff — Free Tools',
  description: 'Compare two texts and see added and removed lines highlighted, in your browser.',
};

export default function TextDiffPage() {
  return (
    <Page>
      <header>
        <Heading>Text Diff</Heading>
        <Text tone="muted">Compare two blocks of text line by line, locally in your browser.</Text>
      </header>
      <TextDiff />
    </Page>
  );
}
