import type { Metadata } from 'next';
import FocusTimer from '@/components/FocusTimer';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Focus Timer (Pomodoro) — Free Tools',
  description: 'A simple Pomodoro focus timer that runs in your browser. No account, no upload.',
};

export default function FocusTimerPage() {
  return (
    <Page>
      <header>
        <Heading>Focus Timer</Heading>
        <Text tone="muted">A simple Pomodoro-style timer, running in your browser.</Text>
      </header>
      <FocusTimer />
    </Page>
  );
}
