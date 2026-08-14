import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Allow crawling the pages, but keep crawlers out of the API. */
export default function robots(): MetadataRoute.Robots {
  return {
    // /api/* serves JSON (e.g. the accessibility-checker audit endpoints), not
    // pages — excluding it keeps those out of Search Console's index reports.
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
