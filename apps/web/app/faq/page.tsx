import type { Metadata } from 'next';
import { Faq } from '@/components/Faq';
import { Heading, Page, Stack, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'FAQ — toolkit',
  description:
    'Answers to common questions about toolkit: whether it’s free, whether anything is uploaded, privacy, offline use and browser support.',
};

export default function FaqPage() {
  return (
    <Page>
      <Stack gap={5}>
        <header>
          <Heading>Frequently asked questions</Heading>
          <Text tone="muted">
            Everything runs in your browser — free, private, and with no account. Here are the
            details.
          </Text>
        </header>
        <Faq />
      </Stack>
    </Page>
  );
}
