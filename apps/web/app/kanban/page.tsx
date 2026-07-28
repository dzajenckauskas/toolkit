import { toolMetadata } from '@/lib/seo';
import KanbanBoard from '@/components/tools/productivity/KanbanBoard';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('kanban');

export default function KanbanPage() {
  return (
    <ToolPage toolId="kanban">
      <KanbanBoard />
    </ToolPage>
  );
}
