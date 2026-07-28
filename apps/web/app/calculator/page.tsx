import { toolMetadata } from '@/lib/seo';
import NotepadCalculator from '@/components/tools/calculators/NotepadCalculator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('calculator');

export default function CalculatorPage() {
  return (
    <ToolPage toolId="calculator">
      <NotepadCalculator />
    </ToolPage>
  );
}
