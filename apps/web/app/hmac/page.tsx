import { toolMetadata } from '@/lib/seo';
import HmacGenerator from '@/components/tools/developer/HmacGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('hmac');

export default function HmacPage() {
  return (
    <ToolPage toolId="hmac">
      <HmacGenerator />
    </ToolPage>
  );
}
