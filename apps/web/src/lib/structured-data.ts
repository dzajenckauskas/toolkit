/**
 * schema.org JSON-LD builders — pure functions returning plain objects that
 * pages serialize into `<script type="application/ld+json">`. Centralised so the
 * tool pages, homepage and FAQ page describe themselves consistently (mirroring
 * the richer per-post markup already emitted by the blog).
 */
import type { Tool, ToolCategory } from '@toolkit/tools/registry';
import { getToolContent } from '@toolkit/tools/content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/site';

/** The publishing organisation, reused across schemas. */
const ORGANIZATION = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og-default.png`,
} as const;

/** Map a tool's catalog category to the closest schema.org applicationCategory. */
const APPLICATION_CATEGORY: Record<ToolCategory, string> = {
  'Images & Media': 'MultimediaApplication',
  'Text & Documents': 'UtilitiesApplication',
  PDF: 'UtilitiesApplication',
  Developer: 'DeveloperApplication',
  Design: 'DesignApplication',
  Privacy: 'SecurityApplication',
  Productivity: 'BusinessApplication',
  Calculators: 'UtilitiesApplication',
};

const abs = (path: string) => `${SITE_URL}${path}`;

/** Strip the light Markdown emphasis authors use, for clean JSON-LD text. */
export function toPlainText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> text
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** `SoftwareApplication` describing a single free, browser-based tool. */
export function softwareApplicationLd(tool: Tool) {
  const content = getToolContent(tool);
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: content.tagline,
    url: abs(tool.href),
    applicationCategory: APPLICATION_CATEGORY[tool.category],
    operatingSystem: 'Any (web browser)',
    browserRequirements: 'Requires a modern web browser with JavaScript.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: ORGANIZATION,
  };
}

/** Breadcrumb trail mirroring the visible All tools / Category / Tool nav. */
export function toolBreadcrumbLd(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'All tools', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: tool.category, item: abs(`/#cat-${tool.category}`) },
      { '@type': 'ListItem', position: 3, name: tool.name, item: abs(tool.href) },
    ],
  };
}

/** `FAQPage` from a list of plain-text question/answer pairs. */
export function faqPageLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: toPlainText(f.a) },
    })),
  };
}

/** `WebSite` describing the hub as a whole (for the homepage). */
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: ORGANIZATION,
  };
}

/** `Organization` entity for the homepage. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    ...ORGANIZATION,
  };
}
