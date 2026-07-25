import type { Metadata } from 'next';
import ImagesToPdf from '@/components/ImagesToPdf';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Images to PDF — Free Tools',
  description: 'Combine images into a single PDF in your browser. No account, no upload.',
};

export default function ImagesToPdfPage() {
  return (
    <ToolPage toolId="images-to-pdf">
      <ImagesToPdf />
    </ToolPage>
  );
}
