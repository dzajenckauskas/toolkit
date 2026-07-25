import type { Metadata } from 'next';
import NumberBaseConverter from '@/components/NumberBaseConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Number Base Converter — Free Tools',
  description: 'Convert numbers between binary, octal, decimal and hex in your browser.',
};

export default function NumberBasePage() {
  return (
    <ToolPage toolId="number-base">
      <NumberBaseConverter />
    </ToolPage>
  );
}
