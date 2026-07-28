import { toolMetadata } from '@/lib/seo';
import FaviconGenerator from '@/components/FaviconGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('favicon');

export default function FaviconPage() {
  return (
    <ToolPage toolId="favicon">
      <FaviconGenerator />
    </ToolPage>
  );
}
