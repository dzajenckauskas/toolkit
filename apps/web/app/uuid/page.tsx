import type { Metadata } from 'next';
import UuidGenerator from '@/components/UuidGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'UUID Generator — Free Tools',
  description: 'Generate random v4 UUIDs in your browser. No account, no upload.',
};

export default function UuidPage() {
  return (
    <Page>
      <header>
        <Heading>UUID Generator</Heading>
        <Text tone="muted">Generate random version-4 UUIDs, locally in your browser.</Text>
      </header>
      <UuidGenerator />
    </Page>
  );
}
