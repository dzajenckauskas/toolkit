import type { Metadata } from 'next';
import HmacGenerator from '@/components/HmacGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'HMAC Generator — Free Tools',
  description: 'Compute HMAC (SHA-1/256/384/512) of a message and key in your browser.',
};

export default function HmacPage() {
  return (
    <Page>
      <header>
        <Heading>HMAC Generator</Heading>
        <Text tone="muted">Compute a keyed HMAC signature, locally in your browser.</Text>
      </header>
      <HmacGenerator />
    </Page>
  );
}
