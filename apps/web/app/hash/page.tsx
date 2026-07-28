import { toolMetadata } from '@/lib/seo';
import HashGenerator from '@/components/HashGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('hash');

export default function HashPage() {
  return (
    <ToolPage toolId="hash">
      <HashGenerator />
    </ToolPage>
  );
}
