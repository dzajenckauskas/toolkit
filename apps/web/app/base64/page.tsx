import { toolMetadata } from '@/lib/seo';
import Base64Tool from '@/components/Base64Tool';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('base64');

export default function Base64Page() {
  return (
    <ToolPage toolId="base64">
      <Base64Tool />
    </ToolPage>
  );
}
