import { toolMetadata } from '@/lib/seo';
import Slugifier from '@/components/tools/text/Slugifier';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('slugify');

export default function SlugifyPage() {
  return (
    <ToolPage toolId="slugify">
      <Slugifier />
    </ToolPage>
  );
}
