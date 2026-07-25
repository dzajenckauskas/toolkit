import type { Metadata } from 'next';
import HashGenerator from '@/components/HashGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Hash Generator (SHA) — Free Tools',
  description: 'Generate SHA-1/256/384/512 hashes of text in your browser. No account, no upload.',
};

export default function HashPage() {
  return (
    <ToolPage toolId="hash">
      <HashGenerator />
    </ToolPage>
  );
}
