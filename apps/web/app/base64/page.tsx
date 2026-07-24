import type { Metadata } from 'next';
import Base64Tool from '@/components/Base64Tool';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Base64 Encode / Decode — Free Tools',
  description: 'Encode and decode Base64 in your browser. UTF-8 safe. No account, no upload.',
};

export default function Base64Page() {
  return (
    <Page>
      <header>
        <Heading>Base64 Encode / Decode</Heading>
        <Text tone="muted">Convert text to and from Base64, locally in your browser.</Text>
      </header>
      <Base64Tool />
    </Page>
  );
}
