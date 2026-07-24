import type { Metadata, Viewport } from 'next';
import EmotionRegistry from '@/theme/EmotionRegistry';
import { AppHeader } from '@/components/AppHeader';
import { NO_FLASH_SCRIPT } from '@/lib/theme-mode';

export const metadata: Metadata = {
  title: 'toolkit — free tools that run in your browser',
  description:
    'A hub of free, private tools that run entirely in your browser. No account, no upload, no paywall.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Set the theme before first paint so a stored dark mode doesn't flash. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        <EmotionRegistry>
          <AppHeader />
          {children}
        </EmotionRegistry>
      </body>
    </html>
  );
}
