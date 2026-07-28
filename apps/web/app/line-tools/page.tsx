import { toolMetadata } from '@/lib/seo';
import LineTools from '@/components/LineTools';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('line-tools');

export default function LineToolsPage() {
  return (
    <ToolPage toolId="line-tools">
      <LineTools />
    </ToolPage>
  );
}
