'use client';

import Link from 'next/link';
import styled from '@emotion/styled';

/**
 * Shared breadcrumb trail, used by tool pages, the blog and the content pages
 * so navigation looks and behaves identically everywhere. Always starts with a
 * Home crumb (house icon + "Home", linking to the catalog); callers pass the
 * rest of the trail. The last crumb is the current page — marked with
 * `aria-current` and rendered as plain text, not a link.
 */

export interface Crumb {
  label: string;
  /** Omitted for the current (last) crumb. */
  href?: string;
  testId?: string;
}

const Nav = styled('nav')({
  position: 'relative',
  zIndex: 1,
  marginBottom: '1rem',
  fontSize: '0.8rem',
});

const List = styled('ol')(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.space(2),
  color: theme.color.muted,
}));

const Item = styled('li')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.space(2),
  '&:not(:first-of-type)::before': {
    content: '"/"',
    color: theme.color.muted,
    opacity: 0.55,
  },
}));

const CrumbLink = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.space(1),
  color: theme.color.muted,
  fontWeight: 600,
  textDecoration: 'none',
  '&:hover': { color: theme.color.text, textDecoration: 'underline' },
  '& svg': { color: 'currentColor' },
}));

const Current = styled('span')(({ theme }) => ({
  color: theme.color.text,
  fontWeight: 600,
}));

function HomeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

export function Breadcrumb({
  trail,
  testId = 'breadcrumb',
  className,
}: {
  /** Crumbs after Home; the last one is the current page. */
  trail: Crumb[];
  testId?: string;
  className?: string;
}) {
  const items: (Crumb & { home?: boolean })[] = [
    { label: 'Home', href: '/', testId: `${testId}-home`, home: true },
    ...trail,
  ];

  return (
    <Nav aria-label="Breadcrumb" data-testid={testId} className={className}>
      <List>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1 || !item.href;
          if (isCurrent) {
            return (
              <Item key={index}>
                <Current aria-current="page" data-testid={item.testId}>
                  {item.label}
                </Current>
              </Item>
            );
          }
          return (
            <Item key={index}>
              <CrumbLink href={item.href!} data-testid={item.testId}>
                {item.home ? <HomeIcon /> : null}
                {item.label}
              </CrumbLink>
            </Item>
          );
        })}
      </List>
    </Nav>
  );
}
