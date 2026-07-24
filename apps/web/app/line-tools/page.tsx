import type { Metadata } from 'next';
import LineTools from '@/components/LineTools';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Line Tools — sort, dedupe, reverse — Free Tools',
  description: 'Sort, de-duplicate, reverse, shuffle and clean lines of text in your browser.',
};

export default function LineToolsPage() {
  return (
    <Page>
      <header>
        <Heading>Line Tools</Heading>
        <Text tone="muted">Sort, de-duplicate, reverse, shuffle and clean lines of text.</Text>
      </header>
      <LineTools />
    </Page>
  );
}
