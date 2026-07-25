import type { Metadata } from 'next';
import QrGenerator from '@/components/QrGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'QR Code Generator — Free Tools',
  description: 'Generate a QR code for any link or text in your browser. No account, no upload.',
};

export default function QrPage() {
  return (
    <ToolPage toolId="qr">
      <QrGenerator />
    </ToolPage>
  );
}
