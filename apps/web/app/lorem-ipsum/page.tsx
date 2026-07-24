import type { Metadata } from 'next';
import LoremIpsum from '@/components/LoremIpsum';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator — Free Tools',
  description: 'Generate placeholder text for layouts and mockups. No account, no upload.',
};

export default function LoremIpsumPage() {
  return (
    <Page>
      <header>
        <Heading>Lorem Ipsum Generator</Heading>
        <Text tone="muted">Placeholder text for your layouts, generated in your browser.</Text>
      </header>
      <LoremIpsum />
    </Page>
  );
}
