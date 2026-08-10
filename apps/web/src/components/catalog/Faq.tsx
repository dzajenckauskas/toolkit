'use client';

import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/site';
import { FaqAccordion, type FaqItem } from '@/components/catalog/FaqAccordion';

/**
 * Site-wide FAQ, rendered with the shared {@link FaqAccordion}. Content is
 * intentionally plain and honest about the client-side, no-upload model.
 */

const FAQS: FaqItem[] = [
  {
    q: 'Is Toolkit really free?',
    a: 'Yes. Every tool is free to use — no account, no sign-up, no trial, and no paywall. There are no usage limits.',
  },
  {
    q: 'Do my files, images or text get uploaded anywhere?',
    a: 'Files, images and text used by the local tools stay in your browser and are not uploaded. The accessibility checker is different and clearly labelled: it sends the public URL you enter to an isolated server-side browser so that website can be audited.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Toolkit has no accounts and no login. Just open a tool and use it.',
  },
  {
    q: 'Is any of my data stored?',
    a: 'Local tools may remember small preferences in browser storage. The accessibility checker creates temporary reports and screenshots on the audit runner; they expire automatically and are not kept as a permanent report library.',
  },
  {
    q: 'Does it work offline?',
    a: 'Once a tool’s page has loaded, its processing happens locally, so it keeps working even with a flaky connection. Loading a page you haven’t visited yet still needs a network request.',
  },
  {
    q: 'Which browsers are supported?',
    a: 'Recent versions of Chrome, Edge, Firefox and Safari. A few tools rely on modern browser APIs (Canvas, Web Crypto), so an up-to-date browser gives the best results.',
  },
  {
    q: 'Can I use what I create commercially?',
    a: 'Yes. The files and output you generate are yours to use however you like. See the Terms & Conditions for the full details.',
  },
  {
    q: 'I found a bug, or I’d like a new tool. How do I get in touch?',
    a: (
      <>
        Suggestions and bug reports are welcome — email <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
        .
      </>
    ),
  },
];

export function Faq() {
  return <FaqAccordion items={FAQS} />;
}
