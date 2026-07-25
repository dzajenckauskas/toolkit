import type { Metadata } from 'next';
import PaletteGenerator from '@/components/PaletteGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Color Palette Generator — Free Tools',
  description: 'Generate harmonies, tints and shades from a base color in your browser.',
};

export default function PalettePage() {
  return (
    <ToolPage toolId="palette">
      <PaletteGenerator />
    </ToolPage>
  );
}
