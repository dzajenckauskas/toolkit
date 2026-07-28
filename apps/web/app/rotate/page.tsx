import { toolMetadata } from '@/lib/seo';
import ImageRotator from '@/components/tools/images/ImageRotator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('rotate');

export default function RotatePage() {
  return (
    <ToolPage toolId="rotate">
      <ImageRotator />
    </ToolPage>
  );
}
