import { toolMetadata } from '@/lib/seo';
import UuidGenerator from '@/components/UuidGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('uuid');

export default function UuidPage() {
  return (
    <ToolPage toolId="uuid">
      <UuidGenerator />
    </ToolPage>
  );
}
