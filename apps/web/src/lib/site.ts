/**
 * Site-wide constants: author/brand identity and contact details, kept in one
 * place so the header, footer, FAQ and Terms pages stay in sync.
 */

/** Product / brand working name. */
export const SITE_NAME = 'toolkit';

/** Canonical production origin — used for metadataBase, canonicals and the sitemap. */
export const SITE_URL = 'https://toolkit.zajenckauskas.lt';

/** One-line site description reused across metadata. */
export const SITE_DESCRIPTION =
  'A hub of free, private tools that run entirely in your browser. No account, no upload, no paywall.';

/** Author credit shown in the footer. */
export const AUTHOR_NAME = 'Danielius';
export const AUTHOR_URL = 'https://zajenckauskas.lt';

/** Contact address used by the "Contact" links (opens the user's mail client). */
export const CONTACT_EMAIL = 'danielius@zajenckauskas.lt';
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'toolkit — hello',
)}`;
