import type { Metadata } from 'next';
import ColorNameFinder from '@/components/ColorNameFinder';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Color Name Finder — Free Tools',
  description: 'Find the nearest CSS named color for any hex value, in your browser.',
};

export default function ColorNamePage() {
  return (
    <ToolPage toolId="color-name">
      <ColorNameFinder />
    </ToolPage>
  );
}
