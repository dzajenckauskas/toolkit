import { toolMetadata } from '@/lib/seo';
import MetadataCleaner from '@/components/MetadataCleaner';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('metadata-cleaner');

export default function MetadataCleanerPage() {
  return (
    <ToolPage toolId="metadata-cleaner">
      <MetadataCleaner />
    </ToolPage>
  );
}
