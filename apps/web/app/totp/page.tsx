import { toolMetadata } from '@/lib/seo';
import TotpGenerator from '@/components/TotpGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('totp');

export default function TotpPage() {
  return (
    <ToolPage toolId="totp">
      <TotpGenerator />
    </ToolPage>
  );
}
