import type { MetadataRoute } from 'next';
import { LIVE_TOOLS } from '@toolkit/tools/registry';
import { SITE_URL } from '@/lib/site';

/**
 * Sitemap generated from the tool registry, so every live tool is indexed and
 * new tools appear automatically the moment their `status` flips to `live`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ['/', '/faq', '/terms'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.5,
  }));

  const toolRoutes = LIVE_TOOLS.map((tool) => ({
    url: `${SITE_URL}${tool.href}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...toolRoutes];
}
