import { toolMetadata } from '@/lib/seo';
import MarkdownEditor from '@/components/tools/text/MarkdownEditor';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('markdown');

export default function MarkdownPage() {
  return (
    <ToolPage toolId="markdown">
      <MarkdownEditor />
    </ToolPage>
  );
}
