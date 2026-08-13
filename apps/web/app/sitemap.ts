import type { MetadataRoute } from 'next';
import { LIVE_TOOLS } from '@toolkit/tools/registry';
import { getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

/**
 * Sitemap generated from the tool registry and the blog, so every live tool and
 * published post is indexed and new entries appear automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ['/', '/blog', '/faq', '/terms'].map((path) => ({
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

  const postRoutes = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(`${post.updated ?? post.date}T00:00:00Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    images: [`${SITE_URL}${post.cover.src}`],
  }));

  return [...staticRoutes, ...toolRoutes, ...postRoutes];
}
