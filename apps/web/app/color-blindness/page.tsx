import type { Metadata } from 'next';
import ColorBlindnessSimulator from '@/components/ColorBlindnessSimulator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Color Blindness Simulator — Free Tools',
  description: 'Preview how a palette looks for different color-vision types, in your browser.',
};

export default function ColorBlindnessPage() {
  return (
    <ToolPage toolId="color-blindness">
      <ColorBlindnessSimulator />
    </ToolPage>
  );
}
