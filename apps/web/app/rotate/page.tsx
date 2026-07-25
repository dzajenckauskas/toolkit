import type { Metadata } from 'next';
import ImageRotator from '@/components/ImageRotator';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Rotate & Flip Image — Free Tools',
  description: 'Rotate and flip an image in your browser. No account, no upload.',
};

export default function RotatePage() {
  return (
    <ToolPage toolId="rotate">
      <ImageRotator />
    </ToolPage>
  );
}
