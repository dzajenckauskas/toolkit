import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import EmotionRegistry from '@/theme/EmotionRegistry';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';
import { NO_FLASH_SCRIPT } from '@/lib/theme-mode';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/site';

// Neris — the display/body sans, self-hosted via next/font so the @font-face
// rules are inlined into the document head (no render-blocking CSS request) and
// the heavy heading weight is preloaded. Only the roman weights actually used
// in the UI are loaded (Light 300, SemiBold 600, Black 900). Geist Sans is a
// metrics-friendly fallback and Geist Mono covers numerals / meta labels.
const neris = localFont({
  src: [
    { path: '../public/fonts/neris/Neris-Light.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/neris/Neris-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/neris/Neris-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-neris',
  display: 'swap',
});

const DEFAULT_TITLE = `${SITE_NAME} — free tools that run in your browser`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    // Tool pages set their own title; this frames anything that doesn't.
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'free online tools',
    'browser tools',
    'privacy',
    'no upload',
    'image tools',
    'developer tools',
    'text tools',
  ],
  alternates: { canonical: '/' },
  icons: {
    // Light/dark SVG favicons — the browser picks by prefers-color-scheme.
    icon: [
      { url: '/favicon-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: '/',
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${neris.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {/* Set the theme before first paint so a stored dark mode doesn't flash. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        <EmotionRegistry>
          <AppHeader />
          {children}
          <Footer />
        </EmotionRegistry>
      </body>
    </html>
  );
}
