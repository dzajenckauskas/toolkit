import type { Metadata } from 'next';
import PercentageCalculator from '@/components/PercentageCalculator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Percentage Calculator — Free Tools',
  description: 'Percentages, percent change, and tip/split calculations in your browser.',
};

export default function PercentagePage() {
  return (
    <Page>
      <header>
        <Heading>Percentage Calculator</Heading>
        <Text tone="muted">Percentages, percent change, and tip splitting — all in one place.</Text>
      </header>
      <PercentageCalculator />
    </Page>
  );
}
