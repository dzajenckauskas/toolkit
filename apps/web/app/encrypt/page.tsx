import type { Metadata } from 'next';
import TextEncryptor from '@/components/TextEncryptor';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Text Encrypt / Decrypt (AES) — Free Tools',
  description:
    'Encrypt and decrypt text with a password (AES-256-GCM) in your browser. Nothing is uploaded.',
};

export default function EncryptPage() {
  return (
    <Page>
      <header>
        <Heading>Text Encrypt / Decrypt</Heading>
        <Text tone="muted">Password-based AES-256 encryption, entirely in your browser.</Text>
      </header>
      <TextEncryptor />
    </Page>
  );
}
