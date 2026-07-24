import type { Metadata } from 'next';
import FaviconGenerator from '@/components/FaviconGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Favicon Generator — Free Tools',
  description: 'Create favicon PNGs at multiple sizes from an image, packaged as a ZIP, in-browser.',
};

export default function FaviconPage() {
  return (
    <Page>
      <header>
        <Heading>Favicon Generator</Heading>
        <Text tone="muted">Create favicon PNGs at multiple sizes from an image, locally.</Text>
      </header>
      <FaviconGenerator />
    </Page>
  );
}
