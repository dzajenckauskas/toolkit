import type { Metadata } from 'next';
import JsonFormatter from '@/components/JsonFormatter';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator — Free Tools',
  description: 'Validate, format and minify JSON in your browser. No account, no upload.',
};

export default function JsonPage() {
  return (
    <ToolPage toolId="json">
      <JsonFormatter />
    </ToolPage>
  );
}
