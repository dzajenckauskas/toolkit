import type { Metadata } from 'next';
import MetadataCleaner from '@/components/MetadataCleaner';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Image Metadata Cleaner — Free Tools',
  description: 'Strip EXIF and GPS metadata from an image in your browser. Nothing is uploaded.',
};

export default function MetadataCleanerPage() {
  return (
    <Page>
      <header>
        <Heading>Metadata Cleaner</Heading>
        <Text tone="muted">Remove EXIF, GPS and other metadata from an image, locally.</Text>
      </header>
      <MetadataCleaner />
    </Page>
  );
}
