import { toolMetadata } from '@/lib/seo';
import Optimizer from '@/components/tools/images/Optimizer';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('optimize');

export default function OptimizePage() {
  return (
    <ToolPage toolId="optimize">
      <Optimizer />
    </ToolPage>
  );
}
