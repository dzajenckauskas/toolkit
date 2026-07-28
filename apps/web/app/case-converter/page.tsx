import { toolMetadata } from '@/lib/seo';
import CaseConverter from '@/components/CaseConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('case-converter');

export default function CaseConverterPage() {
  return (
    <ToolPage toolId="case-converter">
      <CaseConverter />
    </ToolPage>
  );
}
