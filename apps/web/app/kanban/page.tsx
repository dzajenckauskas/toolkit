import type { Metadata } from 'next';
import KanbanBoard from '@/components/KanbanBoard';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Kanban Board — Free Tools',
  description: 'A lightweight local kanban board saved in your browser. No account, no upload.',
};

export default function KanbanPage() {
  return (
    <Page>
      <header>
        <Heading>Kanban Board</Heading>
        <Text tone="muted">A simple board saved in your browser — add cards and move them.</Text>
      </header>
      <KanbanBoard />
    </Page>
  );
}
