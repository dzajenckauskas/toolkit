import type { Metadata } from 'next';
import HashGenerator from '@/components/HashGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Hash Generator (SHA) — Free Tools',
  description: 'Generate SHA-1/256/384/512 hashes of text in your browser. No account, no upload.',
};

export default function HashPage() {
  return (
    <Page>
      <header>
        <Heading>Hash Generator</Heading>
        <Text tone="muted">SHA-1, SHA-256, SHA-384 and SHA-512, computed in your browser.</Text>
      </header>
      <HashGenerator />
    </Page>
  );
}
