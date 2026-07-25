import type { Metadata } from 'next';
import KanbanBoard from '@/components/KanbanBoard';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Kanban Board — Free Tools',
  description: 'A lightweight local kanban board saved in your browser. No account, no upload.',
};

export default function KanbanPage() {
  return (
    <ToolPage toolId="kanban">
      <KanbanBoard />
    </ToolPage>
  );
}
