import type { Metadata } from 'next';
import CsvJsonConverter from '@/components/CsvJsonConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'CSV ↔ JSON Converter — Free Tools',
  description: 'Convert between CSV and JSON in your browser. No account, no upload.',
};

export default function CsvJsonPage() {
  return (
    <ToolPage toolId="csv-json">
      <CsvJsonConverter />
    </ToolPage>
  );
}
