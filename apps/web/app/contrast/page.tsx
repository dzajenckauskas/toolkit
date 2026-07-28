import { toolMetadata } from '@/lib/seo';
import ContrastChecker from '@/components/tools/design/ContrastChecker';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('contrast');

export default function ContrastPage() {
  return (
    <ToolPage toolId="contrast">
      <ContrastChecker />
    </ToolPage>
  );
}
