import type { Metadata } from 'next';
import RegexTester from '@/components/RegexTester';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Regex Tester — Free Tools',
  description: 'Test regular expressions live in your browser. No account, no upload.',
};

export default function RegexPage() {
  return (
    <Page>
      <header>
        <Heading>Regex Tester</Heading>
        <Text tone="muted">
          Test a regular expression against sample text, live in your browser.
        </Text>
      </header>
      <RegexTester />
    </Page>
  );
}
