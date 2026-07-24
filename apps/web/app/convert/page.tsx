import type { Metadata } from 'next';
import ImageConverter from '@/components/ImageConverter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Convert Image (JPG / PNG / WebP) — Free Tools',
  description: 'Convert images between JPG, PNG and WebP in your browser. No account, no upload.',
};

export default function ConvertPage() {
  return (
    <Page>
      <header>
        <Heading>Convert Image</Heading>
        <Text tone="muted">Convert between JPG, PNG and WebP, locally in your browser.</Text>
      </header>
      <ImageConverter />
    </Page>
  );
}
