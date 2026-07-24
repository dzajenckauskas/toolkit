import type { Metadata } from 'next';
import ColorBlindnessSimulator from '@/components/ColorBlindnessSimulator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Color Blindness Simulator — Free Tools',
  description: 'Preview how a palette looks for different color-vision types, in your browser.',
};

export default function ColorBlindnessPage() {
  return (
    <Page>
      <header>
        <Heading>Color Blindness Simulator</Heading>
        <Text tone="muted">Preview how your colors look under different color-vision types.</Text>
      </header>
      <ColorBlindnessSimulator />
    </Page>
  );
}
