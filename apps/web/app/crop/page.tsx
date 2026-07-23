import type { Metadata } from 'next';
import Cropper from '@/components/Cropper';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Image Cropper — Ecommerce Toolkit',
  description:
    'Crop a product image to the right framing and aspect ratio in your browser, then download it.',
};

export default function CropPage() {
  return (
    <Page>
      <header>
        <Heading id="cropper-heading">Image Cropper</Heading>
        <Text tone="muted">
          Add a JPEG, frame the crop, and download it. Nothing is uploaded to a server.
        </Text>
      </header>
      <Cropper />
    </Page>
  );
}
