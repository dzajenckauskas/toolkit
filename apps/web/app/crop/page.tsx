import { toolMetadata } from '@/lib/seo';
import Cropper from '@/components/tools/images/Cropper';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('crop');

export default function CropPage() {
  return (
    <ToolPage toolId="crop">
      <Cropper />
    </ToolPage>
  );
}
