/**
 * Site-wide constants: author/brand identity and contact details, kept in one
 * place so the header, footer, FAQ and Terms pages stay in sync.
 */

/** Product / brand working name. */
export const SITE_NAME = 'toolkit';

/** Author credit shown in the footer. */
export const AUTHOR_NAME = 'Danielius';
export const AUTHOR_URL = 'https://zajenckauskas.lt';

/** Contact address used by the "Contact" links (opens the user's mail client). */
export const CONTACT_EMAIL = 'danielius@zajenckauskas.lt';
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'toolkit — hello',
)}`;
