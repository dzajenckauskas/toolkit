import { toolMetadata } from '@/lib/seo';
import { ToolPage } from '@/components/catalog/ToolPage';
import AccessibilityChecker from '@/components/tools/developer/AccessibilityChecker';

export const metadata = toolMetadata('accessibility-checker');

export default function AccessibilityCheckerPage() {
  return (
    <ToolPage toolId="accessibility-checker">
      <AccessibilityChecker />
    </ToolPage>
  );
}
