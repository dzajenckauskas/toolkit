import { toolMetadata } from '@/lib/seo';
import TotpGenerator from '@/components/tools/developer/TotpGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('totp');

export default function TotpPage() {
  return (
    <ToolPage toolId="totp">
      <TotpGenerator />
    </ToolPage>
  );
}
