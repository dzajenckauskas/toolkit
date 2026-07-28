import { toolMetadata } from '@/lib/seo';
import WordCounter from '@/components/tools/text/WordCounter';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('word-count');

export default function WordCountPage() {
  return (
    <ToolPage toolId="word-count">
      <WordCounter />
    </ToolPage>
  );
}
