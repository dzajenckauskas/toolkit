import type { Metadata } from 'next';
import ScreenshotBeautifier from '@/components/ScreenshotBeautifier';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Screenshot Beautifier — Free Tools',
  description: 'Add a background, padding, rounded corners and shadow to a screenshot, in-browser.',
};

export default function ScreenshotPage() {
  return (
    <ToolPage toolId="screenshot">
      <ScreenshotBeautifier />
    </ToolPage>
  );
}
