import { toolMetadata } from '@/lib/seo';
import ImagePalette from '@/components/tools/design/ImagePalette';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('image-palette');

export default function ImagePalettePage() {
  return (
    <ToolPage toolId="image-palette">
      <ImagePalette />
    </ToolPage>
  );
}
