import type { Metadata } from 'next';
import ImageResizer from '@/components/ImageResizer';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Resize Image — Free Tools',
  description: 'Resize an image to exact dimensions in your browser. No account, no upload.',
};

export default function ResizePage() {
  return (
    <Page>
      <header>
        <Heading>Resize Image</Heading>
        <Text tone="muted">Change an image&apos;s dimensions, locally in your browser.</Text>
      </header>
      <ImageResizer />
    </Page>
  );
}
