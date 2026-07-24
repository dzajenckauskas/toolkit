import type { Metadata } from 'next';
import JsonFormatter from '@/components/JsonFormatter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator — Free Tools',
  description: 'Validate, format and minify JSON in your browser. No account, no upload.',
};

export default function JsonPage() {
  return (
    <Page>
      <header>
        <Heading>JSON Formatter &amp; Validator</Heading>
        <Text tone="muted">Format, minify and validate JSON, locally in your browser.</Text>
      </header>
      <JsonFormatter />
    </Page>
  );
}
