import type { Metadata } from 'next';
import RegexTester from '@/components/RegexTester';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Regex Tester — Free Tools',
  description: 'Test regular expressions live in your browser. No account, no upload.',
};

export default function RegexPage() {
  return (
    <ToolPage toolId="regex">
      <RegexTester />
    </ToolPage>
  );
}
