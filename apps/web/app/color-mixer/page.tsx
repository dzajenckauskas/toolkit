import { toolMetadata } from '@/lib/seo';
import ColorMixer from '@/components/ColorMixer';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('color-mixer');

export default function ColorMixerPage() {
  return (
    <ToolPage toolId="color-mixer">
      <ColorMixer />
    </ToolPage>
  );
}
