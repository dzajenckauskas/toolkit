import { toolMetadata } from '@/lib/seo';
import MetadataCleaner from '@/components/tools/privacy/MetadataCleaner';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('metadata-cleaner');

export default function MetadataCleanerPage() {
  return (
    <ToolPage toolId="metadata-cleaner">
      <MetadataCleaner />
    </ToolPage>
  );
}
