import { toolMetadata } from '@/lib/seo';
import Cropper from '@/components/Cropper';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('crop');

export default function CropPage() {
  return (
    <ToolPage toolId="crop">
      <Cropper />
    </ToolPage>
  );
}
