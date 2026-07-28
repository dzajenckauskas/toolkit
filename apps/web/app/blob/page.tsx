import { toolMetadata } from '@/lib/seo';
import BlobGenerator from '@/components/tools/design/BlobGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('blob');

export default function BlobPage() {
  return (
    <ToolPage toolId="blob">
      <BlobGenerator />
    </ToolPage>
  );
}
