import type { Metadata } from 'next';
import ChecksumVerifier from '@/components/ChecksumVerifier';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'File Checksum Verifier — Free Tools',
  description: 'Compute a file checksum (SHA) and verify it against an expected value, in-browser.',
};

export default function ChecksumPage() {
  return (
    <ToolPage toolId="checksum">
      <ChecksumVerifier />
    </ToolPage>
  );
}
