import type { Metadata } from 'next';
import ImagePalette from '@/components/ImagePalette';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Palette from Image — Free Tools',
  description:
    'Extract a dominant-color palette from an image in your browser. Nothing is uploaded.',
};

export default function ImagePalettePage() {
  return (
    <ToolPage toolId="image-palette">
      <ImagePalette />
    </ToolPage>
  );
}
