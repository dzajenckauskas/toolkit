import { toolMetadata } from '@/lib/seo';
import FocusTimer from '@/components/tools/productivity/FocusTimer';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('focus-timer');

export default function FocusTimerPage() {
  return (
    <ToolPage toolId="focus-timer">
      <FocusTimer />
    </ToolPage>
  );
}
