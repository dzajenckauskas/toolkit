import type { Metadata } from 'next';
import ImageRotator from '@/components/ImageRotator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Rotate & Flip Image — Free Tools',
  description: 'Rotate and flip an image in your browser. No account, no upload.',
};

export default function RotatePage() {
  return (
    <Page>
      <header>
        <Heading>Rotate &amp; Flip</Heading>
        <Text tone="muted">Rotate or flip an image, locally in your browser.</Text>
      </header>
      <ImageRotator />
    </Page>
  );
}
