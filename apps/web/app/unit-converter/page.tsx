import type { Metadata } from 'next';
import UnitConverter from '@/components/UnitConverter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Unit Converter — Free Tools',
  description: 'Convert length, weight, data, time and temperature units in your browser.',
};

export default function UnitConverterPage() {
  return (
    <Page>
      <header>
        <Heading>Unit Converter</Heading>
        <Text tone="muted">Convert length, weight, data, time and temperature, locally.</Text>
      </header>
      <UnitConverter />
    </Page>
  );
}
