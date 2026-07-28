import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Allow crawling everywhere and point crawlers at the generated sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
