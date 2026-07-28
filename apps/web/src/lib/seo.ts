/**
 * SEO helpers — registry-driven page metadata so every tool page stays in sync
 * with the single source of truth (`src/tools/registry.ts`) instead of drifting
 * hand-written titles. Each tool page does `export const metadata =
 * toolMetadata('<id>')`; canonical URL, OpenGraph and Twitter cards are derived.
 */
import type { Metadata } from 'next';
import { TOOLS } from '@/tools/registry';
import { getToolContent } from '@/tools/content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/site';

/** Metadata for a tool page, derived from its registry entry + landing content. */
export function toolMetadata(toolId: string): Metadata {
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) {
    // A page referencing an unknown id is a build-time mistake; fail loudly.
    throw new Error(`toolMetadata: no tool with id "${toolId}"`);
  }

  const description = getToolContent(tool).tagline || tool.description;
  const title = `${tool.name} · ${SITE_NAME}`;

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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
    openGraph: { type: 'website', url: opts.path, title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export { SITE_URL };
