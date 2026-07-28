import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

/** Web app manifest — installable, themed to match the light-mode paper/ink palette. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — free tools that run in your browser`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f4ef',
    theme_color: '#f7f4ef',
    icons: [{ src: '/favicon-light.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
