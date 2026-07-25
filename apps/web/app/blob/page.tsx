import type { Metadata } from 'next';
import BlobGenerator from '@/components/BlobGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'SVG Blob Generator — Free Tools',
  description: 'Generate organic SVG blob shapes and download them, in your browser.',
};

export default function BlobPage() {
  return (
    <ToolPage toolId="blob">
      <BlobGenerator />
    </ToolPage>
  );
}
