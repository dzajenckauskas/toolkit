import type { Metadata } from 'next';
import HtmlEntitiesTool from '@/components/HtmlEntitiesTool';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'HTML Entity Encode / Decode — Free Tools',
  description: 'Escape and unescape HTML entities in your browser. No account, no upload.',
};

export default function HtmlEntitiesPage() {
  return (
    <Page>
      <header>
        <Heading>HTML Entity Encode / Decode</Heading>
        <Text tone="muted">Escape and unescape HTML entities, locally in your browser.</Text>
      </header>
      <HtmlEntitiesTool />
    </Page>
  );
}
