import type { Metadata } from 'next';
import GradientGenerator from '@/components/GradientGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'CSS Gradient Generator — Free Tools',
  description: 'Build linear and radial CSS gradients and copy the CSS, in your browser.',
};

export default function GradientPage() {
  return (
    <ToolPage toolId="gradient">
      <GradientGenerator />
    </ToolPage>
  );
}
