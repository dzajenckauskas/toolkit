import { toolMetadata } from '@/lib/seo';
import FocusTimer from '@/components/FocusTimer';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('focus-timer');

export default function FocusTimerPage() {
  return (
    <ToolPage toolId="focus-timer">
      <FocusTimer />
    </ToolPage>
  );
}
