import type { Metadata } from 'next';
import TotpGenerator from '@/components/TotpGenerator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'TOTP / 2FA Code Generator — Free Tools',
  description:
    'Generate TOTP two-factor codes from a base32 secret in your browser. Nothing is uploaded.',
};

export default function TotpPage() {
  return (
    <Page>
      <header>
        <Heading>TOTP / 2FA Generator</Heading>
        <Text tone="muted">
          Generate time-based one-time codes from a secret, locally in your browser.
        </Text>
      </header>
      <TotpGenerator />
    </Page>
  );
}
