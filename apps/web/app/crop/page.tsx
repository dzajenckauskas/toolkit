import type { Metadata } from 'next';
import Cropper from '@/components/Cropper';
import { ToolPage } from '@/components/ToolPage';

export const metadata: Metadata = {
  title: 'Image Cropper — Ecommerce Toolkit',
  description:
    'Crop a product image to the right framing and aspect ratio in your browser, then download it.',
};

export default function CropPage() {
  return (
    <ToolPage toolId="crop">
      <Cropper />
    </ToolPage>
  );
}
