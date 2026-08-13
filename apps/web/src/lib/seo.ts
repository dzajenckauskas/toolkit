/**
 * SEO helpers — registry-driven page metadata so every tool page stays in sync
 * with the single source of truth (`src/tools/registry.ts`) instead of drifting
 * hand-written titles. Each tool page does `export const metadata =
 * toolMetadata('<id>')`; canonical URL, OpenGraph and Twitter cards are derived.
 */
import type { Metadata } from 'next';
import { TOOLS } from '@toolkit/tools/registry';
import { getToolContent } from '@toolkit/tools/content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, SITE_OG_IMAGE } from '@/lib/site';

/** Metadata for a tool page, derived from its registry entry + landing content. */
export function toolMetadata(toolId: string): Metadata {
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) {
    // A page referencing an unknown id is a build-time mistake; fail loudly.
    throw new Error(`toolMetadata: no tool with id "${toolId}"`);
  }

  const content = getToolContent(tool);
  // Search text is decoupled from the visible name/tagline: the title tag and
  // meta description target real queries, while the card and hero stay concise.
  const description = content.seoDescription || content.tagline || tool.description;
  const title = `${content.seoTitle ?? tool.name} · ${SITE_NAME}`;

  return {
    // `absolute` opts out of the root layout's title template (no double brand).
    title: { absolute: title },
    description,
    alternates: { canonical: tool.href },
    openGraph: {
      type: 'website',
      url: tool.href,
      title,
      description,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_OG_IMAGE.url],
    },
  };
}

/** Metadata for a plain content page (FAQ, Terms) with a canonical URL. */
export function pageMetadata(opts: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  const title = `${opts.title} · ${SITE_NAME}`;
  const description = opts.description ?? SITE_DESCRIPTION;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: 'website',
      url: opts.path,
      title,
      description,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_OG_IMAGE.url],
    },
  };
}

export { SITE_URL };
