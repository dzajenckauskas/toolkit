import type { Metadata, Viewport } from 'next';
import EmotionRegistry from '@/theme/EmotionRegistry';
import { AppHeader } from '@/components/AppHeader';

export const metadata: Metadata = {
  title: 'Ecommerce Toolkit',
  description: 'Prepare ecommerce product images quickly. Starting with the Image Optimizer.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <AppHeader />
          {children}
        </EmotionRegistry>
      </body>
    </html>
  );
}
