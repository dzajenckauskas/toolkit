import type { Metadata } from 'next';
import TextDiff from '@/components/TextDiff';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Text Diff — Free Tools',
  description: 'Compare two texts and see added and removed lines highlighted, in your browser.',
};

export default function TextDiffPage() {
  return (
    <ToolPage toolId="text-diff">
      <TextDiff />
    </ToolPage>
  );
}
