import type { Metadata } from 'next';
import Base64Tool from '@/components/Base64Tool';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Base64 Encode / Decode — Free Tools',
  description: 'Encode and decode Base64 in your browser. UTF-8 safe. No account, no upload.',
};

export default function Base64Page() {
  return (
    <ToolPage toolId="base64">
      <Base64Tool />
    </ToolPage>
  );
}
