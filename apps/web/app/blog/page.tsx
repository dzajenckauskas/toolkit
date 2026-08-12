import { pageMetadata } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog';
import { BlogIndex } from '@/components/blog/BlogIndex';

export const metadata = pageMetadata({
  title: 'Blog',
  description:
    'Practical guides on privacy, developer tooling and design from Toolkit — a hub of free tools that run entirely in your browser.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    date: p.date,
    readingMinutes: p.readingMinutes,
  }));

  return <BlogIndex posts={posts} />;
}
