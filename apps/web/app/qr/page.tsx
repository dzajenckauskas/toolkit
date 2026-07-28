import { toolMetadata } from '@/lib/seo';
import QrGenerator from '@/components/QrGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('qr');

export default function QrPage() {
  return (
    <ToolPage toolId="qr">
      <QrGenerator />
    </ToolPage>
  );
}
