import type { Metadata } from 'next';
import JwtDecoder from '@/components/JwtDecoder';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'JWT Decoder — Free Tools',
  description: 'Decode and inspect JSON Web Tokens in your browser. Nothing leaves your device.',
};

export default function JwtPage() {
  return (
    <Page>
      <header>
        <Heading>JWT Decoder</Heading>
        <Text tone="muted">Inspect a JSON Web Token&apos;s header and payload, locally.</Text>
      </header>
      <JwtDecoder />
    </Page>
  );
}
