import type { Metadata } from 'next';
import ColorConverter from '@/components/ColorConverter';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Color Converter (HEX / RGB / HSL) — Free Tools',
  description: 'Pick a color and convert between HEX, RGB and HSL in your browser.',
};

export default function ColorsPage() {
  return (
    <ToolPage toolId="colors">
      <ColorConverter />
    </ToolPage>
  );
}
