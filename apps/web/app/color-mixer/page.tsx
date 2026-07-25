import type { Metadata } from 'next';
import ColorMixer from '@/components/ColorMixer';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Color Mixer — Free Tools',
  description: 'Blend two colors and get the in-between steps in your browser.',
};

export default function ColorMixerPage() {
  return (
    <ToolPage toolId="color-mixer">
      <ColorMixer />
    </ToolPage>
  );
}
