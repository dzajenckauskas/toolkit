import { toolMetadata } from '@/lib/seo';
import ChecksumVerifier from '@/components/tools/developer/ChecksumVerifier';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('checksum');

export default function ChecksumPage() {
  return (
    <ToolPage toolId="checksum">
      <ChecksumVerifier />
    </ToolPage>
  );
}
