import type { Metadata } from 'next';
import HmacGenerator from '@/components/HmacGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'HMAC Generator — Free Tools',
  description: 'Compute HMAC (SHA-1/256/384/512) of a message and key in your browser.',
};

export default function HmacPage() {
  return (
    <ToolPage toolId="hmac">
      <HmacGenerator />
    </ToolPage>
  );
}
