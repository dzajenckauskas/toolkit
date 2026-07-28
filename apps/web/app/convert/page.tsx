import { toolMetadata } from '@/lib/seo';
import ImageConverter from '@/components/tools/images/ImageConverter';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('convert');

export default function ConvertPage() {
  return (
    <ToolPage toolId="convert">
      <ImageConverter />
    </ToolPage>
  );
}
