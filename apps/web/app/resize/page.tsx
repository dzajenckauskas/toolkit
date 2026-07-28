import { toolMetadata } from '@/lib/seo';
import ImageResizer from '@/components/tools/images/ImageResizer';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('resize');

export default function ResizePage() {
  return (
    <ToolPage toolId="resize">
      <ImageResizer />
    </ToolPage>
  );
}
