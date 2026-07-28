import { toolMetadata } from '@/lib/seo';
import HashGenerator from '@/components/tools/developer/HashGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('hash');

export default function HashPage() {
  return (
    <ToolPage toolId="hash">
      <HashGenerator />
    </ToolPage>
  );
}
