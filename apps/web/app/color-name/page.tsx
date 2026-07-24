import type { Metadata } from 'next';
import ColorNameFinder from '@/components/ColorNameFinder';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Color Name Finder — Free Tools',
  description: 'Find the nearest CSS named color for any hex value, in your browser.',
};

export default function ColorNamePage() {
  return (
    <Page>
      <header>
        <Heading>Color Name Finder</Heading>
        <Text tone="muted">Find the nearest CSS named color for any hex value.</Text>
      </header>
      <ColorNameFinder />
    </Page>
  );
}
