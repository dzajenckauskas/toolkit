import type { Metadata } from 'next';
import ImageConverter from '@/components/ImageConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Convert Image (JPG / PNG / WebP) — Free Tools',
  description: 'Convert images between JPG, PNG and WebP in your browser. No account, no upload.',
};

export default function ConvertPage() {
  return (
    <ToolPage toolId="convert">
      <ImageConverter />
    </ToolPage>
  );
}
