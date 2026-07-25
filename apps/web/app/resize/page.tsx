import type { Metadata } from 'next';
import ImageResizer from '@/components/ImageResizer';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Resize Image — Free Tools',
  description: 'Resize an image to exact dimensions in your browser. No account, no upload.',
};

export default function ResizePage() {
  return (
    <ToolPage toolId="resize">
      <ImageResizer />
    </ToolPage>
  );
}
