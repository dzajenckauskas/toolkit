import type { Metadata } from 'next';
import LineTools from '@/components/LineTools';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Line Tools — sort, dedupe, reverse — Free Tools',
  description: 'Sort, de-duplicate, reverse, shuffle and clean lines of text in your browser.',
};

export default function LineToolsPage() {
  return (
    <ToolPage toolId="line-tools">
      <LineTools />
    </ToolPage>
  );
}
