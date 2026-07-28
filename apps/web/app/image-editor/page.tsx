import { toolMetadata } from '@/lib/seo';
import { ImageEditor } from '@/components/tools/images/ImageEditor';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('image-editor');

export default function ImageEditorPage() {
  return (
    <ToolPage toolId="image-editor">
      <ImageEditor />
    </ToolPage>
  );
}
