import { toolMetadata } from '@/lib/seo';
import HmacGenerator from '@/components/HmacGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('hmac');

export default function HmacPage() {
  return (
    <ToolPage toolId="hmac">
      <HmacGenerator />
    </ToolPage>
  );
}
