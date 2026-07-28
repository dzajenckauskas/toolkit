import { toolMetadata } from '@/lib/seo';
import RegexTester from '@/components/tools/developer/RegexTester';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('regex');

export default function RegexPage() {
  return (
    <ToolPage toolId="regex">
      <RegexTester />
    </ToolPage>
  );
}
