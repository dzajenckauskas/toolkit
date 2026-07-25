'use client';

import styled from '@emotion/styled';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/site';

/**
 * Frequently asked questions, rendered as a keyboard-accessible accordion built
 * on native <details>/<summary> (works with zero JS). Content is intentionally
 * plain and honest about the client-side, no-upload model.
 */

interface QA {
  q: string;
  a: React.ReactNode;
}

const FAQS: QA[] = [
  {
    q: 'Is toolkit really free?',
    a: 'Yes. Every tool is free to use — no account, no sign-up, no trial, and no paywall. There are no usage limits.',
  },
  {
    q: 'Do my files, images or text get uploaded anywhere?',
    a: 'No. Every tool runs entirely in your browser on your own device. Your files and text are never sent to a server, and there is no backend to receive them.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. toolkit has no accounts and no login. Just open a tool and use it.',
  },
  {
    q: 'Is any of my data stored?',
    a: 'Nothing leaves your device. A few tools remember small preferences locally in your browser (for example your light/dark choice, or the cards in the Kanban board) using your browser’s own storage. Clearing your browser data removes it, and it is never uploaded.',
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

const List = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(2),
}));

const Details = styled('details')(({ theme }) => ({
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  overflow: 'hidden',
  '&[open]': {
    borderColor: `color-mix(in srgb, ${theme.color.accent} 40%, ${theme.color.border})`,
  },
}));

const Summary = styled('summary')(({ theme }) => ({
  listStyle: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(3),
  padding: `${theme.space(4)} ${theme.space(5)}`,
  fontWeight: 600,
  color: theme.color.text,
  '&::-webkit-details-marker': { display: 'none' },
  '&:hover': { color: theme.color.accentStrong },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${theme.color.accent} 45%, transparent)`,
  },
  // Chevron that rotates when the item is open.
  '& .chev': {
    flex: 'none',
    transition: 'transform 0.2s ease',
    color: theme.color.subtle,
  },
  'details[open] &  .chev': { transform: 'rotate(180deg)' },
}));

const Answer = styled('div')(({ theme }) => ({
  padding: `0 ${theme.space(5)} ${theme.space(5)}`,
  color: theme.color.muted,
  lineHeight: 1.7,
  '& a': { color: theme.color.accentStrong, fontWeight: 600 },
}));

export function Faq() {
  return (
    <List>
      {FAQS.map(({ q, a }, i) => (
        <Details key={i} data-testid={`faq-item-${i}`}>
          <Summary>
            {q}
            <svg
              className="chev"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </Summary>
          <Answer>{a}</Answer>
        </Details>
      ))}
    </List>
  );
}
