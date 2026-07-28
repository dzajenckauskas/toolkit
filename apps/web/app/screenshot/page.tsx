import { toolMetadata } from '@/lib/seo';
import ScreenshotBeautifier from '@/components/ScreenshotBeautifier';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('screenshot');

export default function ScreenshotPage() {
  return (
    <ToolPage toolId="screenshot">
      <ScreenshotBeautifier />
    </ToolPage>
  );
}
