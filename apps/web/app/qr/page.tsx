import { toolMetadata } from '@/lib/seo';
import QrGenerator from '@/components/tools/images/QrGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('qr');

export default function QrPage() {
  return (
    <ToolPage toolId="qr">
      <QrGenerator />
    </ToolPage>
  );
}
