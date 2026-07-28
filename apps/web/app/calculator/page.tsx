import { toolMetadata } from '@/lib/seo';
import NotepadCalculator from '@/components/NotepadCalculator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('calculator');

export default function CalculatorPage() {
  return (
    <ToolPage toolId="calculator">
      <NotepadCalculator />
    </ToolPage>
  );
}
