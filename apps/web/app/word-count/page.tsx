import type { Metadata } from 'next';
import WordCounter from '@/components/WordCounter';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Word & Character Counter — Free Tools',
  description: 'Count words, characters, sentences and reading time in your browser.',
};

export default function WordCountPage() {
  return (
    <ToolPage toolId="word-count">
      <WordCounter />
    </ToolPage>
  );
}
