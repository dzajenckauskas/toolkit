'use client';

import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/site';
import { SITE_FAQS } from '@/data/site-faqs';
import { FaqAccordion, type FaqItem } from '@/components/catalog/FaqAccordion';

/**
 * Site-wide FAQ, rendered with the shared {@link FaqAccordion}. Content lives in
 * `data/site-faqs.ts` as plain strings (a single source shared with the `/faq`
 * FAQPage structured data); here we turn the contact email into a mailto link.
 */

/** Linkify the contact email inside an answer, leaving other text untouched. */
function renderAnswer(answer: string): React.ReactNode {
  const parts = answer.split(CONTACT_EMAIL);
  if (parts.length === 1) return answer;
  return (
    <>
      {parts[0]}
      <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
      {parts.slice(1).join(CONTACT_EMAIL)}
    </>
  );
}

const ITEMS: FaqItem[] = SITE_FAQS.map(({ q, a }) => ({ q, a: renderAnswer(a) }));

export function Faq() {
  return <FaqAccordion items={ITEMS} />;
}
