import { toolMetadata } from '@/lib/seo';
import ColorNameFinder from '@/components/tools/design/ColorNameFinder';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('color-name');

export default function ColorNamePage() {
  return (
    <ToolPage toolId="color-name">
      <ColorNameFinder />
    </ToolPage>
  );
}
