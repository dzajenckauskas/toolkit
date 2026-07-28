import { toolMetadata } from '@/lib/seo';
import Slugifier from '@/components/Slugifier';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('slugify');

export default function SlugifyPage() {
  return (
    <ToolPage toolId="slugify">
      <Slugifier />
    </ToolPage>
  );
}
