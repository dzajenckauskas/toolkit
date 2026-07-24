import type { Metadata } from 'next';
import ImagePalette from '@/components/ImagePalette';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Palette from Image — Free Tools',
  description:
    'Extract a dominant-color palette from an image in your browser. Nothing is uploaded.',
};

export default function ImagePalettePage() {
  return (
    <Page>
      <header>
        <Heading>Palette from Image</Heading>
        <Text tone="muted">
          Extract the dominant colors from an image — click a swatch to copy.
        </Text>
      </header>
      <ImagePalette />
    </Page>
  );
}
