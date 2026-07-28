import { toolMetadata } from '@/lib/seo';
import UnitConverter from '@/components/tools/calculators/UnitConverter';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('unit-converter');

export default function UnitConverterPage() {
  return (
    <ToolPage toolId="unit-converter">
      <UnitConverter />
    </ToolPage>
  );
}
