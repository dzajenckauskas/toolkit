import type { Metadata } from 'next';
import Optimizer from '@/components/Optimizer';
import { Heading, Page, Text } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Image Optimizer — Ecommerce Toolkit',
  description:
    'Reduce JPEG file size in your browser. Add a photo, optimize it locally, and download the result.',
};

export default function OptimizePage() {
  return (
    <Page>
      <header>
        <Heading id="optimizer-heading">Image Optimizer</Heading>
        <Text tone="muted">
          Add a JPEG and download a smaller version. Nothing is uploaded to a server.
        </Text>
      </header>
      <Optimizer />
    </Page>
  );
}
