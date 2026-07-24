import type { Metadata } from 'next';
import Slugifier from '@/components/Slugifier';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Slugify — URL Slug Generator — Free Tools',
  description: 'Turn any text into a clean URL slug in your browser. No account, no upload.',
};

export default function SlugifyPage() {
  return (
    <Page>
      <header>
        <Heading>Slugify</Heading>
        <Text tone="muted">Turn any title into a clean, URL-friendly slug.</Text>
      </header>
      <Slugifier />
    </Page>
  );
}
