import { toolMetadata } from '@/lib/seo';
import LineTools from '@/components/tools/text/LineTools';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('line-tools');

export default function LineToolsPage() {
  return (
    <ToolPage toolId="line-tools">
      <LineTools />
    </ToolPage>
  );
}
