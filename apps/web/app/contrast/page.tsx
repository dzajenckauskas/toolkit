import { toolMetadata } from '@/lib/seo';
import ContrastChecker from '@/components/ContrastChecker';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('contrast');

export default function ContrastPage() {
  return (
    <ToolPage toolId="contrast">
      <ContrastChecker />
    </ToolPage>
  );
}
