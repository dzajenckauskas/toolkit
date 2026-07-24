import type { Metadata } from 'next';
import CsvJsonConverter from '@/components/CsvJsonConverter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'CSV ↔ JSON Converter — Free Tools',
  description: 'Convert between CSV and JSON in your browser. No account, no upload.',
};

export default function CsvJsonPage() {
  return (
    <Page>
      <header>
        <Heading>CSV ↔ JSON Converter</Heading>
        <Text tone="muted">Convert between CSV and JSON, locally in your browser.</Text>
      </header>
      <CsvJsonConverter />
    </Page>
  );
}
