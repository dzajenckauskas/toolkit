import { toolMetadata } from '@/lib/seo';
import TextDiff from '@/components/tools/text/TextDiff';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('text-diff');

export default function TextDiffPage() {
  return (
    <ToolPage toolId="text-diff">
      <TextDiff />
    </ToolPage>
  );
}
