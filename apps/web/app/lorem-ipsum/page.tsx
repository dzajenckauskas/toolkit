import { toolMetadata } from '@/lib/seo';
import LoremIpsum from '@/components/LoremIpsum';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('lorem-ipsum');

export default function LoremIpsumPage() {
  return (
    <ToolPage toolId="lorem-ipsum">
      <LoremIpsum />
    </ToolPage>
  );
}
