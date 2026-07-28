import { toolMetadata } from '@/lib/seo';
import FaviconGenerator from '@/components/tools/images/FaviconGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('favicon');

export default function FaviconPage() {
  return (
    <ToolPage toolId="favicon">
      <FaviconGenerator />
    </ToolPage>
  );
}
