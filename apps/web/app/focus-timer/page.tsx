import type { Metadata } from 'next';
import FocusTimer from '@/components/FocusTimer';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Focus Timer (Pomodoro) — Free Tools',
  description: 'A simple Pomodoro focus timer that runs in your browser. No account, no upload.',
};

export default function FocusTimerPage() {
  return (
    <ToolPage toolId="focus-timer">
      <FocusTimer />
    </ToolPage>
  );
}
