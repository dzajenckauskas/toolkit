import { toolMetadata } from '@/lib/seo';
import JsonFormatter from '@/components/JsonFormatter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('json');

export default function JsonPage() {
  return (
    <ToolPage toolId="json">
      <JsonFormatter />
    </ToolPage>
  );
}
