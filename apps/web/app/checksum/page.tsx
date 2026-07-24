import type { Metadata } from 'next';
import ChecksumVerifier from '@/components/ChecksumVerifier';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'File Checksum Verifier — Free Tools',
  description: 'Compute a file checksum (SHA) and verify it against an expected value, in-browser.',
};

export default function ChecksumPage() {
  return (
    <Page>
      <header>
        <Heading>File Checksum Verifier</Heading>
        <Text tone="muted">Hash a file and compare it against an expected checksum, locally.</Text>
      </header>
      <ChecksumVerifier />
    </Page>
  );
}
