import { toolMetadata } from '@/lib/seo';
import ImageRotator from '@/components/ImageRotator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('rotate');

export default function RotatePage() {
  return (
    <ToolPage toolId="rotate">
      <ImageRotator />
    </ToolPage>
  );
}
