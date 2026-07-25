import type { Metadata } from 'next';
import FaviconGenerator from '@/components/FaviconGenerator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Favicon Generator — Free Tools',
  description:
    'Create favicon PNGs at multiple sizes from an image, packaged as a ZIP, in-browser.',
};

export default function FaviconPage() {
  return (
    <ToolPage toolId="favicon">
      <FaviconGenerator />
    </ToolPage>
  );
}
