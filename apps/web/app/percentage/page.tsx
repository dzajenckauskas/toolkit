import type { Metadata } from 'next';
import PercentageCalculator from '@/components/PercentageCalculator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Percentage Calculator — Free Tools',
  description: 'Percentages, percent change, and tip/split calculations in your browser.',
};

export default function PercentagePage() {
  return (
    <ToolPage toolId="percentage">
      <PercentageCalculator />
    </ToolPage>
  );
}
