import { toolMetadata } from '@/lib/seo';
import Optimizer from '@/components/Optimizer';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('optimize');

export default function OptimizePage() {
  return (
    <ToolPage toolId="optimize">
      <Optimizer />
    </ToolPage>
  );
}
