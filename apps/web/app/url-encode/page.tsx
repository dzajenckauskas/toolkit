import type { Metadata } from 'next';
import UrlEncoder from '@/components/UrlEncoder';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'URL Encode / Decode — Free Tools',
  description: 'Percent-encode and decode URL components in your browser. No account, no upload.',
};

export default function UrlEncodePage() {
  return (
    <Page>
      <header>
        <Heading>URL Encode / Decode</Heading>
        <Text tone="muted">Percent-encode and decode text for URLs, locally in your browser.</Text>
      </header>
      <UrlEncoder />
    </Page>
  );
}
