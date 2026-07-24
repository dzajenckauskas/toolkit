import type { Metadata } from 'next';
import CaseConverter from '@/components/CaseConverter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Case Converter — Free Tools',
  description: 'Convert text between camelCase, snake_case, Title Case and more, in your browser.',
};

export default function CaseConverterPage() {
  return (
    <Page>
      <header>
        <Heading>Case Converter</Heading>
        <Text tone="muted">Convert text between camelCase, snake_case, Title Case and more.</Text>
      </header>
      <CaseConverter />
    </Page>
  );
}
