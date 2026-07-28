import { toolMetadata } from '@/lib/seo';
import ColorBlindnessSimulator from '@/components/ColorBlindnessSimulator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('color-blindness');

export default function ColorBlindnessPage() {
  return (
    <ToolPage toolId="color-blindness">
      <ColorBlindnessSimulator />
    </ToolPage>
  );
}
