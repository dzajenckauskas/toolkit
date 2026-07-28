import { toolMetadata } from '@/lib/seo';
import UuidGenerator from '@/components/tools/developer/UuidGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('uuid');

export default function UuidPage() {
  return (
    <ToolPage toolId="uuid">
      <UuidGenerator />
    </ToolPage>
  );
}
