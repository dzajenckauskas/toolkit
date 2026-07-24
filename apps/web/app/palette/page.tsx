import type { Metadata } from 'next';
import PaletteGenerator from '@/components/PaletteGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Color Palette Generator — Free Tools',
  description: 'Generate harmonies, tints and shades from a base color in your browser.',
};

export default function PalettePage() {
  return (
    <Page>
      <header>
        <Heading>Color Palette Generator</Heading>
        <Text tone="muted">Harmonies, tints and shades from a base color — click to copy.</Text>
      </header>
      <PaletteGenerator />
    </Page>
  );
}
