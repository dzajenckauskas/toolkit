import { toolMetadata } from '@/lib/seo';
import ColorConverter from '@/components/ColorConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('colors');

export default function ColorsPage() {
  return (
    <ToolPage toolId="colors">
      <ColorConverter />
    </ToolPage>
  );
}
