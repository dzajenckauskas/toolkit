import { toolMetadata } from '@/lib/seo';
import ChecksumVerifier from '@/components/ChecksumVerifier';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('checksum');

export default function ChecksumPage() {
  return (
    <ToolPage toolId="checksum">
      <ChecksumVerifier />
    </ToolPage>
  );
}
