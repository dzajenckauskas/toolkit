import type { Metadata } from 'next';
import UuidGenerator from '@/components/UuidGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'UUID Generator — Free Tools',
  description: 'Generate random v4 UUIDs in your browser. No account, no upload.',
};

export default function UuidPage() {
  return (
    <ToolPage toolId="uuid">
      <UuidGenerator />
    </ToolPage>
  );
}
