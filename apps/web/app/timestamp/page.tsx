import { toolMetadata } from '@/lib/seo';
import TimestampConverter from '@/components/tools/developer/TimestampConverter';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('timestamp');

export default function TimestampPage() {
  return (
    <ToolPage toolId="timestamp">
      <TimestampConverter />
    </ToolPage>
  );
}
