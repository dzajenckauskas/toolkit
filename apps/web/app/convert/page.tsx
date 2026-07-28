import { toolMetadata } from '@/lib/seo';
import ImageConverter from '@/components/ImageConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('convert');

export default function ConvertPage() {
  return (
    <ToolPage toolId="convert">
      <ImageConverter />
    </ToolPage>
  );
}
