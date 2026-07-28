import { toolMetadata } from '@/lib/seo';
import ScreenshotBeautifier from '@/components/tools/images/ScreenshotBeautifier';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('screenshot');

export default function ScreenshotPage() {
  return (
    <ToolPage toolId="screenshot">
      <ScreenshotBeautifier />
    </ToolPage>
  );
}
