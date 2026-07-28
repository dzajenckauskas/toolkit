import { toolMetadata } from '@/lib/seo';
import PercentageCalculator from '@/components/tools/calculators/PercentageCalculator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('percentage');

export default function PercentagePage() {
  return (
    <ToolPage toolId="percentage">
      <PercentageCalculator />
    </ToolPage>
  );
}
