import { toolMetadata } from '@/lib/seo';
import JsonFormatter from '@/components/tools/developer/JsonFormatter';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('json');

export default function JsonPage() {
  return (
    <ToolPage toolId="json">
      <JsonFormatter />
    </ToolPage>
  );
}
