import { toolMetadata } from '@/lib/seo';
import GradientGenerator from '@/components/tools/design/GradientGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('gradient');

export default function GradientPage() {
  return (
    <ToolPage toolId="gradient">
      <GradientGenerator />
    </ToolPage>
  );
}
