import type { Metadata } from 'next';
import GradientGenerator from '@/components/GradientGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'CSS Gradient Generator — Free Tools',
  description: 'Build linear and radial CSS gradients and copy the CSS, in your browser.',
};

export default function GradientPage() {
  return (
    <Page>
      <header>
        <Heading>CSS Gradient Generator</Heading>
        <Text tone="muted">Build linear and radial gradients and copy the CSS.</Text>
      </header>
      <GradientGenerator />
    </Page>
  );
}
