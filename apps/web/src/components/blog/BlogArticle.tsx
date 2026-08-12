'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { Heading, Page, Stack, Text } from '@toolkit/ui';

/**
 * Client-rendered blog post layout. The server route reads and renders the
 * Markdown (and injects JSON-LD); this component owns the styled presentation:
 * breadcrumb, header meta, a "Try the tool" CTA near the top and bottom, the
 * article prose, and a related-posts block.
 */

export interface BlogArticleProps {
  title: string;
  description: string;
  category: string;
  date: string;
  updated?: string;
  readingMinutes: number;
  bodyHtml: string;
  tool: { name: string; href: string };
  related: { slug: string; title: string; description: string }[];
}

const Breadcrumb = styled('nav')({ marginBottom: '1rem', fontSize: '0.9rem' });

const Crumbs = styled('ol')(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.space(2),
  color: theme.color.muted,
}));

const Crumb = styled('li')(({ theme }) => ({
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
  color: theme.color.muted,
  fontWeight: 600,
  textDecoration: 'none',
  '&:hover': { color: theme.color.text, textDecoration: 'underline' },
}));

const Meta = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.space(2),
  color: theme.color.muted,
  fontSize: '0.85rem',
}));

const CategoryTag = styled('span')(({ theme }) => ({
  fontWeight: 700,
  color: theme.color.accentStrong,
}));

const Lead = styled('p')(({ theme }) => ({
  margin: `${theme.space(3)} 0 0`,
  fontSize: '1.15rem',
  lineHeight: 1.5,
  color: theme.color.muted,
}));

const Cta = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.space(2),
  alignSelf: 'flex-start',
  padding: '0.7rem 1.1rem',
  fontWeight: 700,
  color: theme.color.accentContrast,
  background: theme.color.accent,
  border: `1px solid ${theme.color.accent}`,
  borderRadius: theme.radius.pill,
  textDecoration: 'none',
  '&:hover': { background: theme.color.accentStrong, borderColor: theme.color.accentStrong },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

// Long-form article prose. Broader element coverage than the legal Prose since
// posts use sub-headings, ordered lists, inline code and the odd blockquote.
const Article = styled('div')(({ theme }) => ({
  maxWidth: '46rem',
  color: theme.color.text,
  lineHeight: 1.7,
  '& p': { margin: `0 0 ${theme.space(4)}`, color: theme.color.muted },
  '& h2': {
    margin: `${theme.space(8)} 0 ${theme.space(3)}`,
    fontSize: '1.35rem',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    color: theme.color.text,
  },
  '& h3': {
    margin: `${theme.space(6)} 0 ${theme.space(2)}`,
    fontSize: '1.05rem',
    fontWeight: 700,
    color: theme.color.text,
  },
  '& ul, & ol': {
    margin: `0 0 ${theme.space(4)}`,
    paddingLeft: theme.space(5),
    color: theme.color.muted,
  },
  '& li': { margin: `0 0 ${theme.space(2)}` },
  '& a': { color: theme.color.accentStrong, fontWeight: 600 },
  '& strong': { color: theme.color.text, fontWeight: 600 },
  '& code': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.9em',
    padding: '0.1rem 0.35rem',
    borderRadius: theme.radius.sm,
    background: theme.color.surface2,
  },
  '& blockquote': {
    margin: `0 0 ${theme.space(4)}`,
    paddingLeft: theme.space(4),
    borderLeft: `3px solid ${theme.color.border}`,
    color: theme.color.muted,
  },
}));

const RelatedGrid = styled('div')(({ theme }) => ({
  marginTop: theme.space(4),
  display: 'grid',
  gap: theme.space(3),
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
}));

const RelatedCard = styled(Link)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(1),
  padding: theme.space(4),
  color: 'inherit',
  textDecoration: 'none',
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  '&:hover': { borderColor: theme.color.accent },
}));

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function BlogArticle({
  title,
  description,
  category,
  date,
  updated,
  readingMinutes,
  bodyHtml,
  tool,
  related,
}: BlogArticleProps) {
  const ctaLabel = `Try the ${tool.name}`;

  return (
    <Page>
      <Breadcrumb aria-label="Breadcrumb" data-testid="blog-breadcrumb">
        <Crumbs>
          <Crumb>
            <CrumbLink href="/">All tools</CrumbLink>
          </Crumb>
          <Crumb>
            <CrumbLink href="/blog" data-testid="blog-breadcrumb-blog">
              Blog
            </CrumbLink>
          </Crumb>
        </Crumbs>
      </Breadcrumb>

      <Stack gap={4} align="flex-start">
        <Meta>
          <CategoryTag>{category}</CategoryTag>
          <span aria-hidden="true">·</span>
          <span>{readingMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <time dateTime={date}>{formatDate(date)}</time>
          {updated ? <span>· Updated {formatDate(updated)}</span> : null}
        </Meta>

        <Heading>{title}</Heading>
        <Lead>{description}</Lead>

        <Cta href={tool.href} data-testid="blog-cta-top">
          {ctaLabel} →
        </Cta>

        <Article data-testid="blog-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

        <Cta href={tool.href} data-testid="blog-cta-bottom">
          {ctaLabel} →
        </Cta>

        {related.length > 0 ? (
          <div style={{ width: '100%' }}>
            <Text as="h2" weight={900} data-testid="blog-related">
              More in {category}
            </Text>
            <RelatedGrid>
              {related.map((r) => (
                <RelatedCard key={r.slug} href={`/blog/${r.slug}`}>
                  <Text as="span" weight={700}>
                    {r.title}
                  </Text>
                  <Text tone="muted" size="sm">
                    {r.description}
                  </Text>
                </RelatedCard>
              ))}
            </RelatedGrid>
          </div>
        ) : null}
      </Stack>
    </Page>
  );
}
