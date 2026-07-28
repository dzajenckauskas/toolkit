import { toolMetadata } from '@/lib/seo';
import MarkdownEditor from '@/components/MarkdownEditor';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('markdown');

export default function MarkdownPage() {
  return (
    <ToolPage toolId="markdown">
      <MarkdownEditor />
    </ToolPage>
  );
}
