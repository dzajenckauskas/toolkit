import { toolMetadata } from '@/lib/seo';
import PercentageCalculator from '@/components/PercentageCalculator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('percentage');

export default function PercentagePage() {
  return (
    <ToolPage toolId="percentage">
      <PercentageCalculator />
    </ToolPage>
  );
}
