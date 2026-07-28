import { toolMetadata } from '@/lib/seo';
import LoremIpsum from '@/components/tools/text/LoremIpsum';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('lorem-ipsum');

export default function LoremIpsumPage() {
  return (
    <ToolPage toolId="lorem-ipsum">
      <LoremIpsum />
    </ToolPage>
  );
}
