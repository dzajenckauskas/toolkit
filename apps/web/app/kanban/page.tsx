import { toolMetadata } from '@/lib/seo';
import KanbanBoard from '@/components/KanbanBoard';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('kanban');

export default function KanbanPage() {
  return (
    <ToolPage toolId="kanban">
      <KanbanBoard />
    </ToolPage>
  );
}
