import type { Metadata } from 'next';
import CaseConverter from '@/components/CaseConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Case Converter — Free Tools',
  description: 'Convert text between camelCase, snake_case, Title Case and more, in your browser.',
};

export default function CaseConverterPage() {
  return (
    <ToolPage toolId="case-converter">
      <CaseConverter />
    </ToolPage>
  );
}
