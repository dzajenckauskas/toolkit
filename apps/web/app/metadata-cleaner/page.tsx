import type { Metadata } from 'next';
import MetadataCleaner from '@/components/MetadataCleaner';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Image Metadata Cleaner — Free Tools',
  description: 'Strip EXIF and GPS metadata from an image in your browser. Nothing is uploaded.',
};

export default function MetadataCleanerPage() {
  return (
    <ToolPage toolId="metadata-cleaner">
      <MetadataCleaner />
    </ToolPage>
  );
}
