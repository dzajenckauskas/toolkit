import type { Metadata } from 'next';
import PasswordGenerator from '@/components/PasswordGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Password Generator — Free Tools',
  description:
    'Generate strong random passwords in your browser. Cryptographically random, no upload.',
};

export default function PasswordPage() {
  return (
    <Page>
      <header>
        <Heading>Password Generator</Heading>
        <Text tone="muted">
          Strong, cryptographically random passwords, generated locally in your browser.
        </Text>
      </header>
      <PasswordGenerator />
    </Page>
  );
}
