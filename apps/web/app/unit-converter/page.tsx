import { toolMetadata } from '@/lib/seo';
import UnitConverter from '@/components/UnitConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('unit-converter');

export default function UnitConverterPage() {
  return (
    <ToolPage toolId="unit-converter">
      <UnitConverter />
    </ToolPage>
  );
}
