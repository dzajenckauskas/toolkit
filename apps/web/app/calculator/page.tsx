import type { Metadata } from 'next';
import NotepadCalculator from '@/components/NotepadCalculator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Notepad Calculator — Free Tools',
  description: 'Calculate as you type, line by line, in your browser. No account, no upload.',
};

export default function CalculatorPage() {
  return (
    <ToolPage toolId="calculator">
      <NotepadCalculator />
    </ToolPage>
  );
}
