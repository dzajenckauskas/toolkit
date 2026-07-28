import { toolMetadata } from '@/lib/seo';
import GradientGenerator from '@/components/GradientGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('gradient');

export default function GradientPage() {
  return (
    <ToolPage toolId="gradient">
      <GradientGenerator />
    </ToolPage>
  );
}
