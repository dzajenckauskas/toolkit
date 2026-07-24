import type { Metadata } from 'next';
import BlobGenerator from '@/components/BlobGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'SVG Blob Generator — Free Tools',
  description: 'Generate organic SVG blob shapes and download them, in your browser.',
};

export default function BlobPage() {
  return (
    <Page>
      <header>
        <Heading>SVG Blob Generator</Heading>
        <Text tone="muted">Generate organic blob shapes and download the SVG.</Text>
      </header>
      <BlobGenerator />
    </Page>
  );
}
