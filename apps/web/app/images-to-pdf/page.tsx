import type { Metadata } from 'next';
import ImagesToPdf from '@/components/ImagesToPdf';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Images to PDF — Free Tools',
  description: 'Combine images into a single PDF in your browser. No account, no upload.',
};

export default function ImagesToPdfPage() {
  return (
    <Page>
      <header>
        <Heading>Images to PDF</Heading>
        <Text tone="muted">Combine images into a single PDF — one image per page, in order.</Text>
      </header>
      <ImagesToPdf />
    </Page>
  );
}
