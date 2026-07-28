'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { AUTHOR_NAME, AUTHOR_URL, CONTACT_MAILTO, SITE_NAME } from '@/lib/site';
import type { AppTheme } from '@toolkit/ui';

/**
 * Site footer: an author credit (built by Danielius, linking to the personal
 * site) and a small set of links — FAQ, Contact (mailto) and the Terms page.
 */

const Bar = styled('footer')(({ theme }) => ({
  borderTop: `1px solid ${theme.color.border}`,
  background: `color-mix(in srgb, ${theme.color.surface} 60%, transparent)`,
  // Pushes the footer to the viewport bottom on short pages (body is a column).
  marginTop: 'auto',
}));

const Inner = styled('div')(({ theme }) => ({
  maxWidth: 1080,
  margin: '0 auto',
  padding: `${theme.space(6)} ${theme.space(5)}`,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(4),
}));

const Credit = styled('p')(({ theme }) => ({
  margin: 0,
  color: theme.color.muted,
  fontSize: '0.9rem',
  '& a': {
    color: theme.color.text,
    fontWeight: 600,
    textDecoration: 'none',
    borderBottom: `1px solid color-mix(in srgb, ${theme.color.accent} 45%, transparent)`,
    transition: 'color 0.2s ease, border-color 0.2s ease',
  },
  '& a:hover': {
    color: theme.color.accentStrong,
    borderColor: theme.color.accent,
  },
}));

const Nav = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.space(5),
  fontSize: '0.9rem',
}));

const linkCss = (theme: AppTheme) => ({
  color: theme.color.muted,
  textDecoration: 'none',
  fontWeight: 600,
  transition: 'color 0.2s ease',
  '&:hover': { color: theme.color.text },
  '&:focus-visible': {
    outline: 'none',
    color: theme.color.text,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 32%, transparent)`,
    borderRadius: '0.4rem',
  },
});

const FooterLink = styled(Link)(({ theme }) => linkCss(theme));
const FooterAnchor = styled('a')(({ theme }) => linkCss(theme));

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <Bar>
      <Inner>
        <Credit>
          Built by{' '}
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="footer-author"
          >
            {AUTHOR_NAME}
          </a>{' '}
          · © {year} {SITE_NAME}
        </Credit>
        <Nav aria-label="Footer">
          <FooterLink href="/faq" data-testid="footer-faq">
            FAQ
          </FooterLink>
          <FooterAnchor href={CONTACT_MAILTO} data-testid="footer-contact">
            Contact
          </FooterAnchor>
          <FooterLink href="/terms" data-testid="footer-terms">
            Terms &amp; Conditions
          </FooterLink>
        </Nav>
      </Inner>
    </Bar>
  );
}
