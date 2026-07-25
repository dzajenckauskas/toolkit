import type { Metadata } from 'next';
import Optimizer from '@/components/Optimizer';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Image Optimizer — Ecommerce Toolkit',
  description:
    'Reduce JPEG file size in your browser. Add a photo, optimize it locally, and download the result.',
};

export default function OptimizePage() {
  return (
    <ToolPage toolId="optimize">
      <Optimizer />
    </ToolPage>
  );
}
