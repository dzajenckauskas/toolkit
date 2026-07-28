import { toolMetadata } from '@/lib/seo';
import TextDiff from '@/components/TextDiff';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('text-diff');

export default function TextDiffPage() {
  return (
    <ToolPage toolId="text-diff">
      <TextDiff />
    </ToolPage>
  );
}
