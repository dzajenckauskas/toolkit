import type { Metadata } from 'next';
import ColorMixer from '@/components/ColorMixer';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Color Mixer — Free Tools',
  description: 'Blend two colors and get the in-between steps in your browser.',
};

export default function ColorMixerPage() {
  return (
    <Page>
      <header>
        <Heading>Color Mixer</Heading>
        <Text tone="muted">Blend two colors and get the steps in between — click to copy.</Text>
      </header>
      <ColorMixer />
    </Page>
  );
}
