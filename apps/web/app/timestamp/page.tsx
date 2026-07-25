import type { Metadata } from 'next';
import TimestampConverter from '@/components/TimestampConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Unix Timestamp Converter — Free Tools',
  description: 'Convert between Unix timestamps and human dates in your browser.',
};

export default function TimestampPage() {
  return (
    <ToolPage toolId="timestamp">
      <TimestampConverter />
    </ToolPage>
  );
}
