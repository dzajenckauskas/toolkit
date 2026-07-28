import { toolMetadata } from '@/lib/seo';
import CsvJsonConverter from '@/components/CsvJsonConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('csv-json');

export default function CsvJsonPage() {
  return (
    <ToolPage toolId="csv-json">
      <CsvJsonConverter />
    </ToolPage>
  );
}
