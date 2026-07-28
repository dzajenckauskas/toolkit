import { toolMetadata } from '@/lib/seo';
import WordCounter from '@/components/WordCounter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('word-count');

export default function WordCountPage() {
  return (
    <ToolPage toolId="word-count">
      <WordCounter />
    </ToolPage>
  );
}
