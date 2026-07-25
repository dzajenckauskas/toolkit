import type { Metadata } from 'next';
import MarkdownEditor from '@/components/MarkdownEditor';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Markdown Editor & Preview — Free Tools',
  description: 'Write Markdown with a live preview in your browser. No account, no upload.',
};

export default function MarkdownPage() {
  return (
    <ToolPage toolId="markdown">
      <MarkdownEditor />
    </ToolPage>
  );
}
