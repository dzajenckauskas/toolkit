import { toolMetadata } from '@/lib/seo';
import PaletteGenerator from '@/components/PaletteGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata = toolMetadata('palette');

export default function PalettePage() {
  return (
    <ToolPage toolId="palette">
      <PaletteGenerator />
    </ToolPage>
  );
}
