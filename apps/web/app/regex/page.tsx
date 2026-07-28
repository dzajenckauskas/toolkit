import { toolMetadata } from '@/lib/seo';
import RegexTester from '@/components/RegexTester';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('regex');

export default function RegexPage() {
  return (
    <ToolPage toolId="regex">
      <RegexTester />
    </ToolPage>
  );
}
