import { toolMetadata } from '@/lib/seo';
import CsvJsonConverter from '@/components/tools/developer/CsvJsonConverter';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('csv-json');

export default function CsvJsonPage() {
  return (
    <ToolPage toolId="csv-json">
      <CsvJsonConverter />
    </ToolPage>
  );
}
