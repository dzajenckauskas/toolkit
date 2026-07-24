import type { Metadata } from 'next';
import QrGenerator from '@/components/QrGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'QR Code Generator — Free Tools',
  description: 'Generate a QR code for any link or text in your browser. No account, no upload.',
};

export default function QrPage() {
  return (
    <Page>
      <header>
        <Heading>QR Code Generator</Heading>
        <Text tone="muted">Generate a QR code for any link or text, locally in your browser.</Text>
      </header>
      <QrGenerator />
    </Page>
  );
}
