import { toolMetadata } from '@/lib/seo';
import ImageResizer from '@/components/ImageResizer';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('resize');

export default function ResizePage() {
  return (
    <ToolPage toolId="resize">
      <ImageResizer />
    </ToolPage>
  );
}
