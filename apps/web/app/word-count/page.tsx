import type { Metadata } from 'next';
import WordCounter from '@/components/WordCounter';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Word & Character Counter — Free Tools',
  description: 'Count words, characters, sentences and reading time in your browser.',
};

export default function WordCountPage() {
  return (
    <Page>
      <header>
        <Heading>Word &amp; Character Counter</Heading>
        <Text tone="muted">Count words, characters, sentences and reading time, locally.</Text>
      </header>
      <WordCounter />
    </Page>
  );
}
