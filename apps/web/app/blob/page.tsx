import { toolMetadata } from '@/lib/seo';
import BlobGenerator from '@/components/BlobGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('blob');

export default function BlobPage() {
  return (
    <ToolPage toolId="blob">
      <BlobGenerator />
    </ToolPage>
  );
}
