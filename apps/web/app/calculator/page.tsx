import type { Metadata } from 'next';
import NotepadCalculator from '@/components/NotepadCalculator';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Notepad Calculator — Free Tools',
  description: 'Calculate as you type, line by line, in your browser. No account, no upload.',
};

export default function CalculatorPage() {
  return (
    <Page>
      <header>
        <Heading>Notepad Calculator</Heading>
        <Text tone="muted">Type calculations line by line and see each result instantly.</Text>
      </header>
      <NotepadCalculator />
    </Page>
  );
}
