import { toolMetadata } from '@/lib/seo';
import TimestampConverter from '@/components/TimestampConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('timestamp');

export default function TimestampPage() {
  return (
    <ToolPage toolId="timestamp">
      <TimestampConverter />
    </ToolPage>
  );
}
