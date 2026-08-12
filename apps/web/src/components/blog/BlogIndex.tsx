'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { Heading, Page, Stack, Text } from '@toolkit/ui';

/**
 * Blog index: a newest-first list of post cards. Kept flat (no category pages)
 * until there are enough posts to justify a taxonomy, per the launch plan.
 */

export interface BlogIndexItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingMinutes: number;
}

const Grid = styled('div')(({ theme }) => ({
  marginTop: theme.space(6),
  display: 'grid',
  gap: theme.space(4),
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
}));

const Card = styled(Link)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(2),
  padding: theme.space(5),
  color: 'inherit',
  textDecoration: 'none',
  background: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  transition: 'border-color 0.12s ease',
  '&:hover': { borderColor: theme.color.accent },
  '&:focus-visible': {
    outline: 'none',
    borderColor: theme.color.accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.color.accent} 35%, transparent)`,
  },
}));

const CardMeta = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.space(2),
  fontSize: '0.8rem',
  color: theme.color.muted,
}));

const CategoryTag = styled('span')(({ theme }) => ({
  fontWeight: 700,
  color: theme.color.accentStrong,
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

export function BlogIndex({ posts }: { posts: BlogIndexItem[] }) {
  return (
    <Page wide>
      <Stack gap={2}>
        <Heading>Blog</Heading>
        <Text tone="muted">
          Practical, no-fluff guides on privacy, developer workflows and design — from the team
          behind a set of tools that run entirely in your browser.
        </Text>
      </Stack>

      <Grid data-testid="blog-list">
        {posts.map((post) => (
          <Card key={post.slug} href={`/blog/${post.slug}`} data-testid={`blog-card-${post.slug}`}>
            <CardMeta>
              <CategoryTag>{post.category}</CategoryTag>
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </CardMeta>
            <Text as="span" weight={700} size="lg">
              {post.title}
            </Text>
            <Text tone="muted" size="sm">
              {post.description}
            </Text>
            <Text tone="subtle" size="sm">
              {formatDate(post.date)}
            </Text>
          </Card>
        ))}
      </Grid>
    </Page>
  );
}
