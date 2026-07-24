import type { Metadata } from 'next';
import ColorConverter from '@/components/ColorConverter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Color Converter (HEX / RGB / HSL) — Free Tools',
  description: 'Pick a color and convert between HEX, RGB and HSL in your browser.',
};

export default function ColorsPage() {
  return (
    <Page>
      <header>
        <Heading>Color Converter</Heading>
        <Text tone="muted">Pick a color and convert between HEX, RGB and HSL.</Text>
      </header>
      <ColorConverter />
    </Page>
  );
}
