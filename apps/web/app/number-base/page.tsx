import { toolMetadata } from '@/lib/seo';
import NumberBaseConverter from '@/components/tools/developer/NumberBaseConverter';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('number-base');

export default function NumberBasePage() {
  return (
    <ToolPage toolId="number-base">
      <NumberBaseConverter />
    </ToolPage>
  );
}
