/**
 * Site-wide constants: author/brand identity and contact details, kept in one
 * place so the header, footer, FAQ and Terms pages stay in sync.
 */

/** Product / brand working name. */
export const SITE_NAME = 'Toolkit';

/** Canonical production origin — used for metadataBase, canonicals and the sitemap. */
export const SITE_URL = 'https://toolkit.zajenckauskas.lt';

/** One-line site description reused across metadata. */
export const SITE_DESCRIPTION =
  'A hub of free, privacy-conscious browser tools. No account or paywall; server-assisted tools are clearly labelled.';

/**
 * Default social-share card (1200×630, in `public/`). Every page that doesn't
 * set its own image (the blog overrides per post) reuses this, so a card
 * refresh is a single asset swap.
 */
export const SITE_OG_IMAGE = {
  url: '/og-default.png',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — free tools that run in your browser`,
} as const;

/** Author credit shown in the footer. */
export const AUTHOR_NAME = 'Danielius';
export const AUTHOR_URL = 'https://zajenckauskas.lt';

/** Contact address used by the "Contact" links (opens the user's mail client). */
export const CONTACT_EMAIL = 'danielius@zajenckauskas.lt';
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'Toolkit — hello',
)}`;
