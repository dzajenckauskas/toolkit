import { toolMetadata } from '@/lib/seo';
import ImagesToPdf from '@/components/ImagesToPdf';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('images-to-pdf');

export default function ImagesToPdfPage() {
  return (
    <ToolPage toolId="images-to-pdf">
      <ImagesToPdf />
    </ToolPage>
  );
}
