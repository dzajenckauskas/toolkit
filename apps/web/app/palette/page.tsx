import { toolMetadata } from '@/lib/seo';
import PaletteGenerator from '@/components/tools/design/PaletteGenerator';
import { ToolPage } from '@/components/catalog/ToolPage';

export const metadata = toolMetadata('palette');

export default function PalettePage() {
  return (
    <ToolPage toolId="palette">
      <PaletteGenerator />
    </ToolPage>
  );
}
