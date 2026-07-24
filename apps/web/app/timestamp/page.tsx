import type { Metadata } from 'next';
import TimestampConverter from '@/components/TimestampConverter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Unix Timestamp Converter — Free Tools',
  description: 'Convert between Unix timestamps and human dates in your browser.',
};

export default function TimestampPage() {
  return (
    <Page>
      <header>
        <Heading>Unix Timestamp Converter</Heading>
        <Text tone="muted">Convert between Unix timestamps and human dates, locally.</Text>
      </header>
      <TimestampConverter />
    </Page>
  );
}
