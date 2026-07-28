import { toolMetadata } from '@/lib/seo';
import ColorConverter from '@/components/tools/design/ColorConverter';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('colors');

export default function ColorsPage() {
  return (
    <ToolPage toolId="colors">
      <ColorConverter />
    </ToolPage>
  );
}
