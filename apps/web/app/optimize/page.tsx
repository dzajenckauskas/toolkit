import type { Metadata } from 'next';
import Optimizer from '@/components/Optimizer';

export const metadata: Metadata = {
  title: 'Image Optimizer — Ecommerce Toolkit',
  description:
    'Reduce JPEG file size in your browser. Add a photo, optimize it locally, and download the result.',
};

export default function OptimizePage() {
  return (
    <main className="page">
      <header className="hero">
        <h1 id="optimizer-heading">Image Optimizer</h1>
        <p>Add a JPEG and download a smaller version. Nothing is uploaded to a server.</p>
      </header>
      <Optimizer />
    </main>
  );
}
