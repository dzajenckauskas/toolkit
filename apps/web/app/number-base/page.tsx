import type { Metadata } from 'next';
import NumberBaseConverter from '@/components/NumberBaseConverter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Number Base Converter — Free Tools',
  description: 'Convert numbers between binary, octal, decimal and hex in your browser.',
};

export default function NumberBasePage() {
  return (
    <Page>
      <header>
        <Heading>Number Base Converter</Heading>
        <Text tone="muted">Convert between binary, octal, decimal and hex, locally.</Text>
      </header>
      <NumberBaseConverter />
    </Page>
  );
}
