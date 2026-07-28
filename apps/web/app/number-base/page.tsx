import { toolMetadata } from '@/lib/seo';
import NumberBaseConverter from '@/components/NumberBaseConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('number-base');

export default function NumberBasePage() {
  return (
    <ToolPage toolId="number-base">
      <NumberBaseConverter />
    </ToolPage>
  );
}
